import "server-only";

import type { PendingSignupRecord } from "./types";

export interface CreatePendingSignupInput {
  email: string;
  name: string;
  passwordHash: string;
  otpHash: string;
  expiresAt: string;
  resendAvailableAt: string;
}

export interface PendingSignupRepository {
  /**
   * Insert or replace the pending signup for `email`. Replacing is desirable
   * so a user who restarts signup gets a fresh OTP and the old code is invalid.
   */
  upsert(input: CreatePendingSignupInput): Promise<PendingSignupRecord>;
  findByEmail(email: string): Promise<PendingSignupRecord | null>;
  /**
   * Atomically increment the attempt counter and return the updated record.
   * Used to throttle brute-force guessing.
   */
  incrementAttempts(email: string): Promise<PendingSignupRecord | null>;
  /**
   * Replace the OTP hash + cooldown for an existing pending signup.
   * Used by the resend endpoint.
   */
  refreshOtp(
    email: string,
    otpHash: string,
    expiresAt: string,
    resendAvailableAt: string,
  ): Promise<PendingSignupRecord | null>;
  delete(email: string): Promise<void>;
}

let repoPromise: Promise<PendingSignupRepository> | null = null;

export async function getPendingSignupRepository(): Promise<PendingSignupRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      if (process.env.MONGO_DB_URL) {
        const { MongoPendingSignupRepository } = await import(
          "./repositories/mongo-pending-signup-repository"
        );
        return new MongoPendingSignupRepository();
      }
      const { JsonPendingSignupRepository } = await import(
        "./repositories/json-pending-signup-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[auth] JsonPendingSignupRepository is DEV-ONLY. Set MONGO_DB_URL to use the Mongo-backed repository.",
        );
      }
      return new JsonPendingSignupRepository();
    })();
  }
  return repoPromise;
}
