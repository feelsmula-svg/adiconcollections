import "server-only";

import type { Collection, Document } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";

import type { StoreProfileRepository } from "../store-profile-repository";
import {
  DEFAULT_STORE_PROFILE_SETTINGS,
  type StoreProfileSettings,
} from "../types";

const COLLECTION = "app_settings";
const SINGLETON_KEY = "store-profile";

interface StoreProfileDoc extends StoreProfileSettings, Document {
  key: string;
}

async function collection(): Promise<Collection<StoreProfileDoc>> {
  const db = await getDb();
  const coll = db.collection<StoreProfileDoc>(COLLECTION);
  await coll.createIndex({ key: 1 }, { unique: true });
  return coll;
}

function strip(doc: StoreProfileDoc & { _id?: unknown }): StoreProfileSettings {
  const { _id, key, ...rest } = doc;
  void _id;
  void key;
  return {
    brandName:
      typeof rest.brandName === "string" && rest.brandName.trim()
        ? rest.brandName
        : DEFAULT_STORE_PROFILE_SETTINGS.brandName,
    supportEmail:
      typeof rest.supportEmail === "string" && rest.supportEmail.trim()
        ? rest.supportEmail
        : DEFAULT_STORE_PROFILE_SETTINGS.supportEmail,
    currency:
      typeof rest.currency === "string" && rest.currency.trim()
        ? rest.currency.toUpperCase()
        : DEFAULT_STORE_PROFILE_SETTINGS.currency,
    updatedAt: rest.updatedAt ?? DEFAULT_STORE_PROFILE_SETTINGS.updatedAt,
  };
}

export class MongoStoreProfileRepository implements StoreProfileRepository {
  async get(): Promise<StoreProfileSettings> {
    const coll = await collection();
    const doc = await coll.findOne({ key: SINGLETON_KEY });
    if (!doc) return DEFAULT_STORE_PROFILE_SETTINGS;
    return strip(doc);
  }

  async update(
    input: Omit<StoreProfileSettings, "updatedAt">,
  ): Promise<StoreProfileSettings> {
    const coll = await collection();
    const next: StoreProfileSettings = {
      ...input,
      updatedAt: new Date().toISOString(),
    };
    await coll.updateOne(
      { key: SINGLETON_KEY },
      {
        $set: { ...next },
        $setOnInsert: { key: SINGLETON_KEY },
      },
      { upsert: true },
    );
    return next;
  }
}
