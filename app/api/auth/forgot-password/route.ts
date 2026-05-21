import { NextResponse } from "next/server";

import { forgotPasswordSchema } from "@/app/lib/auth/schemas";
import { getResetTokenRepository } from "@/app/lib/auth/reset-token-repository";
import {
  generateResetToken,
  RESET_TOKEN_TTL_MS,
} from "@/app/lib/auth/server";
import { getUserRepository } from "@/app/lib/auth/user-repository";

// TODO: rate-limit POST /api/auth/forgot-password (e.g. 3 req/min/IP).
// TODO: send a real transactional email (Resend / SES / Postmark) with the reset URL.

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
    const userRepo = await getUserRepository();
    const user = await userRepo.findByEmail(parsed.data.email);
    if (user) {
      const tokenRepo = await getResetTokenRepository();
      const { plaintext, hash } = generateResetToken();
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
      await tokenRepo.create({
        tokenHash: hash,
        userId: user.id,
        email: user.email,
        expiresAt,
      });

      const url = new URL(request.url);
      const origin = `${url.protocol}//${url.host}`;
      const resetUrl = `${origin}/auth/reset?token=${plaintext}`;

      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[auth/forgot-password] DEV reset link for ${user.email}: ${resetUrl}`,
        );
      }
      // TODO: send email here. e.g. await sendResetEmail(user.email, resetUrl).
      void resetUrl;
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "forgot-password failed";
    console.error("[auth/forgot-password] error:", message);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

function isJson(request: Request): boolean {
  const ct = request.headers.get("content-type") ?? "";
  return ct.toLowerCase().startsWith("application/json");
}
