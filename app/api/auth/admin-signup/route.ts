import { NextResponse } from "next/server";
import { z } from "zod";

import { buildSessionCookie } from "@/app/lib/auth/cookie";
import {
  DuplicateEmailError,
} from "@/app/lib/auth/repositories/json-user-repository";
import { signupSchema } from "@/app/lib/auth/schemas";
import {
  hashPassword,
  signSession,
  toPublicUser,
} from "@/app/lib/auth/server";
import { getUserRepository } from "@/app/lib/auth/user-repository";
import { notifyAdmins } from "@/app/lib/notifications/notify";
import { getAdminSignupSettings } from "@/app/lib/settings/admin-signup/actions";

const adminSignupSchema = signupSchema.extend({
  inviteCode: z.string().trim().max(120).optional().default(""),
});

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

  const settings = await getAdminSignupSettings();
  if (!settings.enabled) {
    return NextResponse.json(
      { error: "Admin signup is currently closed." },
      { status: 403 },
    );
  }

  const parsed = adminSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (settings.inviteCode.length > 0) {
    if (parsed.data.inviteCode !== settings.inviteCode) {
      return NextResponse.json(
        {
          error: "Invite code is incorrect",
          fieldErrors: { inviteCode: ["Invite code is incorrect"] },
        },
        { status: 403 },
      );
    }
  }

  try {
    const repo = await getUserRepository();
    const approvedAdminCount = await repo.countAdmins(true);
    const adminStatus = approvedAdminCount === 0 ? "approved" : "pending";

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await repo.create({
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
      role: "admin",
      adminStatus,
    });

    if (adminStatus === "pending") {
      void notifyAdmins({
        kind: "admin-signup-pending",
        title: `New admin request from ${user.name || user.email}`,
        body: `${user.email} is waiting for approval. Review and approve in admin settings.`,
        link: "/admin/settings",
      });
      return NextResponse.json(
        {
          user: toPublicUser(user),
          pending: true,
          message:
            "Your admin request has been submitted. An existing admin must approve your account before you can sign in.",
        },
        { status: 202 },
      );
    }

    const token = await signSession({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json(
      { user: toPublicUser(user), pending: false },
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
      error instanceof Error ? error.message : "Admin signup failed";
    console.error("[auth/admin-signup] error:", message);
    return NextResponse.json(
      { error: "Admin signup failed. Please try again." },
      { status: 500 },
    );
  }
}

function isJson(request: Request): boolean {
  const ct = request.headers.get("content-type") ?? "";
  return ct.toLowerCase().startsWith("application/json");
}
