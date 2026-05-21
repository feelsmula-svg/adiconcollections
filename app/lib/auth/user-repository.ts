import "server-only";

import type { UserRecord, UserRole } from "./types";

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
  role?: UserRole;
}

export interface ListUsersFilters {
  role?: UserRole;
  q?: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  list(filters?: ListUsersFilters): Promise<UserRecord[]>;
  create(input: CreateUserInput): Promise<UserRecord>;
  updatePassword(id: string, passwordHash: string): Promise<UserRecord | null>;
  updateRole(id: string, role: UserRole): Promise<UserRecord | null>;
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
