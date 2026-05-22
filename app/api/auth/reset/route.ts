import { NextResponse } from "next/server";

import { buildSessionCookie } from "@/app/lib/auth/cookie";
import { resetPasswordSchema } from "@/app/lib/auth/schemas";
import { getResetTokenRepository } from "@/app/lib/auth/reset-token-repository";
import {
  hashPassword,
  hashResetToken,
  signSession,
  toPublicUser,
} from "@/app/lib/auth/server";
import { getUserRepository } from "@/app/lib/auth/user-repository";

// TODO: rate-limit POST /api/auth/reset (e.g. 5 req/min/IP).

const INVALID_TOKEN =
  "This reset link is invalid or has expired. Please request a new one.";

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

  const parsed = resetPasswordSchema.safeParse(body);
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
    const tokenRepo = await getResetTokenRepository();
    const tokenHash = hashResetToken(parsed.data.token);
    const record = await tokenRepo.findActiveByHash(tokenHash);
    if (!record) {
      return NextResponse.json({ error: INVALID_TOKEN }, { status: 400 });
    }

    // Consume the token BEFORE doing anything else. If the password update
    // later fails, the user simply requests a new reset link — that is far
    // better than leaving a still-valid token around if the consume step
    // ever fails after a successful password change.
    await tokenRepo.consume(tokenHash);

    const userRepo = await getUserRepository();
    const passwordHash = await hashPassword(parsed.data.password);
    const updated = await userRepo.updatePassword(record.userId, passwordHash);
    if (!updated) {
      // User was deleted between token issue and reset.
      return NextResponse.json({ error: INVALID_TOKEN }, { status: 400 });
    }

    // Invalidate any other active reset tokens for this user — if two reset
    // links were issued in quick succession, only one can ever be used.
    await tokenRepo.consumeAllForUser(record.userId);

    // Sign the user in immediately so they land back in their account.
    const sessionToken = await signSession({
      sub: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
    });

    const response = NextResponse.json(
      { user: toPublicUser(updated) },
      { status: 200 },
    );
    const cookie = buildSessionCookie(sessionToken);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Password reset failed";
    console.error("[auth/reset] error:", message);
    return NextResponse.json(
      { error: "Password reset failed. Please try again." },
      { status: 500 },
    );
  }
}

function isJson(request: Request): boolean {
  const ct = request.headers.get("content-type") ?? "";
  return ct.toLowerCase().startsWith("application/json");
}
