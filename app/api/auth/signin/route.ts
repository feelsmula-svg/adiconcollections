import { NextResponse } from "next/server";

import { buildSessionCookie } from "@/app/lib/auth/cookie";
import { signinSchema } from "@/app/lib/auth/schemas";
import {
  constantTimeRejectPassword,
  signSession,
  toPublicUser,
  verifyPassword,
} from "@/app/lib/auth/server";
import { getUserRepository } from "@/app/lib/auth/user-repository";

// TODO: rate-limit POST /api/auth/signin (e.g. 5 req/min/IP).

const INVALID_CREDENTIALS = "Invalid email or password";

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

  const parsed = signinSchema.safeParse(body);
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
    const user = await repo.findByEmail(parsed.data.email);

    if (!user) {
      await constantTimeRejectPassword(parsed.data.password);
      return NextResponse.json(
        { error: INVALID_CREDENTIALS },
        { status: 401 },
      );
    }

    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: INVALID_CREDENTIALS },
        { status: 401 },
      );
    }

    if (user.role === "admin" && user.adminStatus === "pending") {
      return NextResponse.json(
        {
          error:
            "Your admin account is pending approval from an existing admin. You'll be able to sign in once it's approved.",
        },
        { status: 403 },
      );
    }

    const token = await signSession({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json(
      { user: toPublicUser(user) },
      { status: 200 },
    );
    const cookie = buildSessionCookie(token);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Sign-in failed";
    console.error("[auth/signin] error:", message);
    return NextResponse.json(
      { error: "Sign-in failed. Please try again." },
      { status: 500 },
    );
  }
}

function isJson(request: Request): boolean {
  const ct = request.headers.get("content-type") ?? "";
  return ct.toLowerCase().startsWith("application/json");
}
