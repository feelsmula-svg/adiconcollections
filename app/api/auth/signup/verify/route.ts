import { NextResponse } from "next/server";

import { buildSessionCookie } from "@/app/lib/auth/cookie";
import { getPendingSignupRepository } from "@/app/lib/auth/pending-signup-repository";
import { verifySignupOtpSchema } from "@/app/lib/auth/schemas";
import {
  hashSignupOtp,
  SIGNUP_OTP_MAX_ATTEMPTS,
  signSession,
  toPublicUser,
} from "@/app/lib/auth/server";
import { getUserRepository } from "@/app/lib/auth/user-repository";
import { notifyUser } from "@/app/lib/notifications/notify";

// TODO: rate-limit POST /api/auth/signup/verify (e.g. 10 req/min/IP).

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

  const parsed = verifySignupOtpSchema.safeParse(body);
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
    const pendingRepo = await getPendingSignupRepository();
    const pending = await pendingRepo.findByEmail(parsed.data.email);
    if (!pending) {
      return NextResponse.json(
        {
          error:
            "This verification code is no longer valid. Please start sign-up again.",
        },
        { status: 404 },
      );
    }

    if (pending.attempts >= SIGNUP_OTP_MAX_ATTEMPTS) {
      await pendingRepo.delete(parsed.data.email);
      return NextResponse.json(
        {
          error:
            "Too many incorrect codes. Please start sign-up again to get a fresh code.",
        },
        { status: 429 },
      );
    }

    const submittedHash = hashSignupOtp(parsed.data.code);
    if (submittedHash !== pending.otpHash) {
      const updated = await pendingRepo.incrementAttempts(parsed.data.email);
      const remaining = updated
        ? Math.max(SIGNUP_OTP_MAX_ATTEMPTS - updated.attempts, 0)
        : 0;
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
              : "Too many incorrect codes. Please start sign-up again.",
          fieldErrors: { code: ["Incorrect code"] },
        },
        { status: 400 },
      );
    }

    // Code matches — create the user.
    const userRepo = await getUserRepository();
    const user = await userRepo.create({
      email: pending.email,
      name: pending.name,
      passwordHash: pending.passwordHash,
    });

    // Best-effort cleanup of the pending record; ignore failures so a
    // transient storage hiccup never blocks login of the new account.
    void pendingRepo.delete(parsed.data.email).catch(() => undefined);

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

    const firstName = user.name.split(" ")[0] || user.name;
    void notifyUser({
      userId: user.id,
      kind: "other",
      title: "Welcome to AdiCon Collections",
      body:
        `Hi ${firstName}, welcome to AdiCon Collections! Your account is ready — ` +
        `browse our latest drops, save your favorites, and track every order from ` +
        `your dashboard. We're glad to have you with us.`,
      link: "/account",
      email: user.email,
      emailSubject: "Welcome to AdiCon Collections",
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "DuplicateEmailError") {
      return NextResponse.json(
        { error: "An account with that email already exists" },
        { status: 409 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Verification failed";
    console.error("[auth/signup/verify] error:", message);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 },
    );
  }
}

function isJson(request: Request): boolean {
  const ct = request.headers.get("content-type") ?? "";
  return ct.toLowerCase().startsWith("application/json");
}
