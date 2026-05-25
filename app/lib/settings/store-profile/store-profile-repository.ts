import "server-only";

import type { StoreProfileSettings } from "./types";

export interface StoreProfileRepository {
  get(): Promise<StoreProfileSettings>;
  update(
    input: Omit<StoreProfileSettings, "updatedAt">,
  ): Promise<StoreProfileSettings>;
}

let repoPromise: Promise<StoreProfileRepository> | null = null;

export async function getStoreProfileRepository(): Promise<StoreProfileRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      if (process.env.MONGO_DB_URL) {
        const { MongoStoreProfileRepository } = await import(
          "./repositories/mongo-store-profile-repository"
        );
        return new MongoStoreProfileRepository();
      }
      const { JsonStoreProfileRepository } = await import(
        "./repositories/json-store-profile-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[store-profile] JsonStoreProfileRepository is DEV-ONLY. Set MONGO_DB_URL to use the Mongo-backed repository.",
        );
      }
      return new JsonStoreProfileRepository();
    })();
  }
  return repoPromise;
}
