import "server-only";

import type { PasswordResetRecord } from "./types";

export interface CreateResetTokenInput {
  tokenHash: string;
  userId: string;
  email: string;
  expiresAt: string;
}

export interface ResetTokenRepository {
  create(input: CreateResetTokenInput): Promise<PasswordResetRecord>;
  findActiveByHash(tokenHash: string): Promise<PasswordResetRecord | null>;
  consume(tokenHash: string): Promise<void>;
  consumeAllForUser(userId: string): Promise<void>;
}

let repoPromise: Promise<ResetTokenRepository> | null = null;

export async function getResetTokenRepository(): Promise<ResetTokenRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      if (process.env.MONGO_DB_URL) {
        const { MongoResetTokenRepository } = await import(
          "./repositories/mongo-reset-token-repository"
        );
        return new MongoResetTokenRepository();
      }
      const { JsonResetTokenRepository } = await import(
        "./repositories/json-reset-token-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[auth] JsonResetTokenRepository is DEV-ONLY. Set MONGO_DB_URL to use the Mongo-backed repository.",
        );
      }
      return new JsonResetTokenRepository();
    })();
  }
  return repoPromise;
}
