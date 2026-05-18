import { NextResponse } from "next/server";

import { buildClearCookie, SESSION_COOKIE } from "@/app/lib/auth/cookie";
import { getSessionUser } from "@/app/lib/auth/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getSessionUser();

  if (user) {
    return NextResponse.json({ user }, { status: 200 });
  }

  const response = NextResponse.json({ user: null }, { status: 200 });
  // If the client sent a cookie but it's invalid/expired, clear it so the
  // browser stops sending stale data.
  if (request.headers.get("cookie")?.includes(`${SESSION_COOKIE}=`)) {
    const cookie = buildClearCookie();
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}
