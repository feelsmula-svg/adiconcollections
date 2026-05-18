import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { forgotPasswordSchema } from "@/app/lib/auth/schemas";
import { getUserRepository } from "@/app/lib/auth/user-repository";

// TODO: rate-limit POST /api/auth/forgot-password (e.g. 3 req/min/IP).
// TODO: persist reset tokens (table `password_resets`) once a real DB exists.

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

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // Always respond 200 regardless of whether the user exists — no enumeration.
  try {
    if (process.env.NODE_ENV !== "production") {
      const repo = await getUserRepository();
      const user = await repo.findByEmail(parsed.data.email);
      if (user) {
        const token = randomBytes(32).toString("hex");
        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;
        console.warn(
          `[auth/forgot-password] DEV reset link for ${user.email}: ${origin}/auth/reset?token=${token}`,
        );
      }
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "forgot-password lookup failed";
    console.error("[auth/forgot-password] error:", message);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

function isJson(request: Request): boolean {
  const ct = request.headers.get("content-type") ?? "";
  return ct.toLowerCase().startsWith("application/json");
}
