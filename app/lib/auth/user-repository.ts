import "server-only";

import type { UserRecord } from "./types";

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(input: CreateUserInput): Promise<UserRecord>;
}

let repoPromise: Promise<UserRepository> | null = null;

export async function getUserRepository(): Promise<UserRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      const { JsonUserRepository } = await import(
        "./repositories/json-user-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[auth] JsonUserRepository is DEV-ONLY. It is not safe across serverless invocations or multiple workers.",
        );
      }
      return new JsonUserRepository();
    })();
  }
  return repoPromise;
}
