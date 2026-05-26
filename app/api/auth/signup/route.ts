import { NextResponse } from "next/server";

import { signupSchema } from "@/app/lib/auth/schemas";
import {
  generateSignupOtp,
  hashPassword,
  SIGNUP_OTP_RESEND_COOLDOWN_MS,
  SIGNUP_OTP_TTL_MS,
} from "@/app/lib/auth/server";
import { getPendingSignupRepository } from "@/app/lib/auth/pending-signup-repository";
import { sendSignupOtpEmail } from "@/app/lib/auth/signup-otp-email";
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
    const userRepo = await getUserRepository();
    const existing = await userRepo.findByEmail(parsed.data.email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const { code, hash: otpHash } = generateSignupOtp();
    const now = Date.now();
    const pendingRepo = await getPendingSignupRepository();
    await pendingRepo.upsert({
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
      otpHash,
      expiresAt: new Date(now + SIGNUP_OTP_TTL_MS).toISOString(),
      resendAvailableAt: new Date(
        now + SIGNUP_OTP_RESEND_COOLDOWN_MS,
      ).toISOString(),
    });

    await sendSignupOtpEmail(parsed.data.email, parsed.data.name, code);

    return NextResponse.json(
      {
        pending: true,
        email: parsed.data.email,
        resendInMs: SIGNUP_OTP_RESEND_COOLDOWN_MS,
        expiresInMs: SIGNUP_OTP_TTL_MS,
      },
      { status: 202 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Sign-up failed";
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
