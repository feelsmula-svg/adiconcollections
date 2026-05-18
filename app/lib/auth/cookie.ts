import "server-only";

import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const SESSION_COOKIE = "adicon.session";

const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

type CookieOptions = Partial<ResponseCookie>;

const baseOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});

export function buildSessionCookie(token: string): {
  name: string;
  value: string;
  options: CookieOptions;
} {
  return {
    name: SESSION_COOKIE,
    value: token,
    options: { ...baseOptions(), maxAge: SEVEN_DAYS_SECONDS },
  };
}

export function buildClearCookie(): {
  name: string;
  value: string;
  options: CookieOptions;
} {
  return {
    name: SESSION_COOKIE,
    value: "",
    options: { ...baseOptions(), maxAge: 0 },
  };
}
