import "server-only";

import type { AdminStatus, UserRecord, UserRole } from "./types";

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
  role?: UserRole;
  adminStatus?: AdminStatus;
}

export interface ListUsersFilters {
  role?: UserRole;
  adminStatus?: AdminStatus;
  q?: string;
}

export interface UpdateUserProfileInput {
  name?: string;
  phone?: string | null;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  list(filters?: ListUsersFilters): Promise<UserRecord[]>;
  create(input: CreateUserInput): Promise<UserRecord>;
  updatePassword(id: string, passwordHash: string): Promise<UserRecord | null>;
  updateRole(id: string, role: UserRole): Promise<UserRecord | null>;
  updateProfile(
    id: string,
    input: UpdateUserProfileInput,
  ): Promise<UserRecord | null>;
  updateAdminStatus(
    id: string,
    status: AdminStatus,
  ): Promise<UserRecord | null>;
  countAdmins(approvedOnly?: boolean): Promise<number>;
  findPrimaryAdmin(): Promise<UserRecord | null>;
  delete(id: string): Promise<boolean>;
}

let repoPromise: Promise<UserRepository> | null = null;

export async function getUserRepository(): Promise<UserRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      if (process.env.MONGO_DB_URL) {
        const { MongoUserRepository } = await import(
          "./repositories/mongo-user-repository"
        );
        return new MongoUserRepository();
      }
      const { JsonUserRepository } = await import(
        "./repositories/json-user-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[auth] JsonUserRepository is DEV-ONLY. Set MONGO_DB_URL to use the Mongo-backed repository.",
        );
      }
      return new JsonUserRepository();
    })();
  }
  return repoPromise;
}
