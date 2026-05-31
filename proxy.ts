import { NextResponse, type NextRequest } from "next/server";

// In-memory sliding-window rate limiter.
//
// CAVEAT: this is per-instance state. On Vercel / multi-instance hosts the
// effective limit is (limit × instance count). For production, swap the
// `hitsByKey` Map for an Upstash Redis (or similar) sliding-window client.
// The interface (rateLimit -> { ok, retryAfterSec }) is intentionally simple
// so the swap is a small change.

interface RuleConfig {
  limit: number;
  windowMs: number;
}

const RULES: Record<string, RuleConfig> = {
  "/api/auth/signin": { limit: 5, windowMs: 15 * 60 * 1000 },
  "/api/auth/signup": { limit: 5, windowMs: 60 * 60 * 1000 },
  "/api/auth/admin-signup": { limit: 5, windowMs: 60 * 60 * 1000 },
  "/api/auth/forgot-password": { limit: 3, windowMs: 60 * 60 * 1000 },
  "/api/auth/reset": { limit: 5, windowMs: 15 * 60 * 1000 },
  "/api/contact/messages": { limit: 5, windowMs: 60 * 60 * 1000 },
};

const hitsByKey = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function rateLimit(
  key: string,
  rule: RuleConfig,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const cutoff = now - rule.windowMs;
  const existing = hitsByKey.get(key) ?? [];
  const recent = existing.filter((ts) => ts > cutoff);
  if (recent.length >= rule.limit) {
    const oldest = recent[0]!;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((oldest + rule.windowMs - now) / 1000),
    );
    hitsByKey.set(key, recent);
    return { ok: false, retryAfterSec };
  }
  recent.push(now);
  hitsByKey.set(key, recent);
  return { ok: true };
}

export function proxy(request: NextRequest) {
  if (request.method !== "POST") return NextResponse.next();
  const rule = RULES[request.nextUrl.pathname];
  if (!rule) return NextResponse.next();

  const ip = getClientIp(request);
  const result = rateLimit(`${request.nextUrl.pathname}:${ip}`, rule);
  if (result.ok) return NextResponse.next();

  return new NextResponse(
    JSON.stringify({
      error:
        "Too many attempts from this address. Please wait a moment and try again.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfterSec),
      },
    },
  );
}

export const config = {
  matcher: [
    "/api/auth/signin",
    "/api/auth/signup",
    "/api/auth/admin-signup",
    "/api/auth/forgot-password",
    "/api/auth/reset",
    "/api/contact/messages",
  ],
};
