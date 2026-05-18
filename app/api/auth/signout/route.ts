import { NextResponse } from "next/server";

import { buildClearCookie } from "@/app/lib/auth/cookie";

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 });
  const cookie = buildClearCookie();
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
