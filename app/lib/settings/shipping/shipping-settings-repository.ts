import "server-only";

import type { ShippingSettings } from "./types";

export interface ShippingSettingsRepository {
  get(): Promise<ShippingSettings>;
  update(input: Omit<ShippingSettings, "updatedAt">): Promise<ShippingSettings>;
}

let repoPromise: Promise<ShippingSettingsRepository> | null = null;

export async function getShippingSettingsRepository(): Promise<ShippingSettingsRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      if (process.env.MONGO_DB_URL) {
        const { MongoShippingSettingsRepository } = await import(
          "./repositories/mongo-shipping-settings-repository"
        );
        return new MongoShippingSettingsRepository();
      }
      const { JsonShippingSettingsRepository } = await import(
        "./repositories/json-shipping-settings-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[shipping-settings] JsonShippingSettingsRepository is DEV-ONLY. Set MONGO_DB_URL to use the Mongo-backed repository.",
        );
      }
      return new JsonShippingSettingsRepository();
    })();
  }
  return repoPromise;
}
