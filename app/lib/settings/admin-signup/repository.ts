import "server-only";

import type { AdminSignupSettings } from "./types";

export interface AdminSignupSettingsRepository {
  get(): Promise<AdminSignupSettings>;
  update(
    input: Omit<AdminSignupSettings, "updatedAt">,
  ): Promise<AdminSignupSettings>;
}

let repoPromise: Promise<AdminSignupSettingsRepository> | null = null;

export async function getAdminSignupSettingsRepository(): Promise<AdminSignupSettingsRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      if (process.env.MONGO_DB_URL) {
        const { MongoAdminSignupSettingsRepository } = await import(
          "./repositories/mongo-admin-signup-settings-repository"
        );
        return new MongoAdminSignupSettingsRepository();
      }
      const { JsonAdminSignupSettingsRepository } = await import(
        "./repositories/json-admin-signup-settings-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[admin-signup] JsonAdminSignupSettingsRepository is DEV-ONLY. Set MONGO_DB_URL to use the Mongo-backed repository.",
        );
      }
      return new JsonAdminSignupSettingsRepository();
    })();
  }
  return repoPromise;
}
