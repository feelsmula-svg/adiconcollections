import { NextResponse } from "next/server";

import { getPendingSignupRepository } from "@/app/lib/auth/pending-signup-repository";
import { resendSignupOtpSchema } from "@/app/lib/auth/schemas";
import {
  generateSignupOtp,
  SIGNUP_OTP_RESEND_COOLDOWN_MS,
  SIGNUP_OTP_TTL_MS,
} from "@/app/lib/auth/server";
import { sendSignupOtpEmail } from "@/app/lib/auth/signup-otp-email";

// TODO: rate-limit POST /api/auth/signup/resend (e.g. 3 req/min/IP).

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

  const parsed = resendSignupOtpSchema.safeParse(body);
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
    const repo = await getPendingSignupRepository();
    const pending = await repo.findByEmail(parsed.data.email);
    if (!pending) {
      return NextResponse.json(
        {
          error:
            "We couldn't find a pending sign-up for that address. Please start again.",
        },
        { status: 404 },
      );
    }

    const now = Date.now();
    const cooldownRemaining =
      new Date(pending.resendAvailableAt).getTime() - now;
    if (cooldownRemaining > 0) {
      return NextResponse.json(
        {
          error: `Please wait ${Math.ceil(cooldownRemaining / 1000)}s before requesting a new code.`,
          retryInMs: cooldownRemaining,
        },
        { status: 429 },
      );
    }

    const { code, hash: otpHash } = generateSignupOtp();
    const refreshed = await repo.refreshOtp(
      parsed.data.email,
      otpHash,
      new Date(now + SIGNUP_OTP_TTL_MS).toISOString(),
      new Date(now + SIGNUP_OTP_RESEND_COOLDOWN_MS).toISOString(),
    );
    if (!refreshed) {
      return NextResponse.json(
        {
          error:
            "Could not refresh your verification code. Please start sign-up again.",
        },
        { status: 404 },
      );
    }

    await sendSignupOtpEmail(refreshed.email, refreshed.name, code);

    return NextResponse.json(
      {
        email: refreshed.email,
        resendInMs: SIGNUP_OTP_RESEND_COOLDOWN_MS,
        expiresInMs: SIGNUP_OTP_TTL_MS,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Resend failed";
    console.error("[auth/signup/resend] error:", message);
    return NextResponse.json(
      { error: "Could not resend code. Please try again." },
      { status: 500 },
    );
  }
}

function isJson(request: Request): boolean {
  const ct = request.headers.get("content-type") ?? "";
  return ct.toLowerCase().startsWith("application/json");
}
