import "server-only";

import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { SESSION_COOKIE } from "./cookie";
import type { PublicUser, SessionPayload, UserRecord } from "./types";
import { getUserRepository } from "./user-repository";

const JWT_ISSUER = "adicon-collections";
const JWT_AUDIENCE = "adicon-collections.session";
const JWT_EXPIRES_IN = "7d";
const BCRYPT_COST = 10;

export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function generateResetToken(): { plaintext: string; hash: string } {
  const plaintext = randomBytes(32).toString("hex");
  return { plaintext, hash: hashResetToken(plaintext) };
}

export function hashResetToken(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

const DUMMY_HASH =
  "$2a$10$CwTycUXWue0Thq9StjUM0uJ8w7l6xL0fA7gqLDJqgKxJxq3y7e0R6";

let cachedSecret: Uint8Array | null = null;

export function getAuthSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET is not set or is too short. Add a 32+ byte base64 value to .env.local (see .env.example).",
    );
  }
  cachedSecret = new TextEncoder().encode(secret);
  return cachedSecret;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(getAuthSecret());
}

export async function verifySession(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, getAuthSecret(), {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
  if (typeof payload.sub !== "string") {
    throw new Error("Invalid session payload: missing subject");
  }
  const role = payload.role === "admin" ? "admin" : "customer";
  return {
    sub: payload.sub,
    email: typeof payload.email === "string" ? payload.email : "",
    name: typeof payload.name === "string" ? payload.name : "",
    role,
  };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function constantTimeRejectPassword(plain: string): Promise<void> {
  // Run a compare against a fixed hash so request timing for "no such user"
  // matches "wrong password" — neutralises timing-based user enumeration.
  await bcrypt.compare(plain, DUMMY_HASH);
}

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    phone: user.phone,
    adminStatus: user.role === "admin" ? user.adminStatus : undefined,
  };
}

export async function getSessionUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = await verifySession(token);
    const repo = await getUserRepository();
    const user = await repo.findById(payload.sub);
    if (!user) return null;
    // Pending admins must be approved before any authenticated route is
    // available to them — treat their session as absent everywhere.
    if (user.role === "admin" && user.adminStatus === "pending") return null;
    return toPublicUser(user);
  } catch {
    return null;
  }
}

export class AdminAccessError extends Error {
  constructor() {
    super("Admin access required");
    this.name = "AdminAccessError";
  }
}

export async function requireAdmin(): Promise<PublicUser> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new AdminAccessError();
  }
  if (user.adminStatus === "pending") {
    throw new AdminAccessError();
  }
  return user;
}
