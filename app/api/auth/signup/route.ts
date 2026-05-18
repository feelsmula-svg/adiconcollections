import { NextResponse } from "next/server";

import { buildSessionCookie } from "@/app/lib/auth/cookie";
import { signupSchema } from "@/app/lib/auth/schemas";
import {
  hashPassword,
  signSession,
  toPublicUser,
} from "@/app/lib/auth/server";
import {
  DuplicateEmailError,
  // type import only — class lives in repo impl file
} from "@/app/lib/auth/repositories/json-user-repository";
import { getUserRepository } from "@/app/lib/auth/user-repository";

// TODO: rate-limit POST /api/auth/signup (e.g. 5 req/min/IP) before exposing publicly.

export async function POST(request: Request) {
  if (!isJson(request)) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 415 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const repo = await getUserRepository();
    const passwordHash = await hashPassword(parsed.data.password);
    const user = await repo.create({
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
    });

    const token = await signSession({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      { user: toPublicUser(user) },
      { status: 200 },
    );
    const cookie = buildSessionCookie(token);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error: unknown) {
    if (error instanceof DuplicateEmailError) {
      return NextResponse.json(
        { error: "An account with that email already exists" },
        { status: 409 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Sign-up failed";
    console.error("[auth/signup] error:", message);
    return NextResponse.json(
      { error: "Sign-up failed. Please try again." },
      { status: 500 },
    );
  }
}

function isJson(request: Request): boolean {
  const ct = request.headers.get("content-type") ?? "";
  return ct.toLowerCase().startsWith("application/json");
}
