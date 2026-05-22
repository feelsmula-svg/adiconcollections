import "server-only";

import type { RewardsSettings } from "./types";

export interface RewardsSettingsRepository {
  get(): Promise<RewardsSettings>;
  update(input: Omit<RewardsSettings, "updatedAt">): Promise<RewardsSettings>;
}

let repoPromise: Promise<RewardsSettingsRepository> | null = null;

export async function getRewardsSettingsRepository(): Promise<RewardsSettingsRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      if (process.env.MONGO_DB_URL) {
        const { MongoRewardsSettingsRepository } = await import(
          "./repositories/mongo-rewards-settings-repository"
        );
        return new MongoRewardsSettingsRepository();
      }
      const { JsonRewardsSettingsRepository } = await import(
        "./repositories/json-rewards-settings-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[rewards-settings] JsonRewardsSettingsRepository is DEV-ONLY. Set MONGO_DB_URL to use the Mongo-backed repository.",
        );
      }
      return new JsonRewardsSettingsRepository();
    })();
  }
  return repoPromise;
}
