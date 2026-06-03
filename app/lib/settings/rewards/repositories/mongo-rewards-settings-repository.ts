import "server-only";

import type { Collection, Document } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";

import type { RewardsSettingsRepository } from "../rewards-settings-repository";
import {
  DEFAULT_REWARDS_SETTINGS,
  type RewardsSettings,
} from "../types";

const COLLECTION = "app_settings";
const SINGLETON_KEY = "rewards";

interface RewardsSettingsDoc extends RewardsSettings, Document {
  key: string;
}

let _collectionPromise: Promise<Collection<RewardsSettingsDoc>> | null = null;

function collection(): Promise<Collection<RewardsSettingsDoc>> {
  if (!_collectionPromise) {
    _collectionPromise = (async () => {
      const db = await getDb();
      const coll = db.collection<RewardsSettingsDoc>(COLLECTION);
      await coll.createIndex({ key: 1 }, { unique: true });
      return coll;
    })().catch((err) => { _collectionPromise = null; throw err; });
  }
  return _collectionPromise;
}

function strip(doc: RewardsSettingsDoc & { _id?: unknown }): RewardsSettings {
  const { _id, key, ...rest } = doc;
  void _id;
  void key;
  return {
    enabled: rest.enabled,
    displayToCustomers: rest.displayToCustomers ?? true,
    pointsPerDollar: rest.pointsPerDollar,
    tiers: rest.tiers,
    updatedAt: rest.updatedAt,
  };
}

export class MongoRewardsSettingsRepository
  implements RewardsSettingsRepository
{
  async get(): Promise<RewardsSettings> {
    const coll = await collection();
    const doc = await coll.findOne({ key: SINGLETON_KEY });
    if (!doc) return DEFAULT_REWARDS_SETTINGS;
    return strip(doc);
  }

  async update(
    input: Omit<RewardsSettings, "updatedAt">,
  ): Promise<RewardsSettings> {
    const coll = await collection();
    const next: RewardsSettings = {
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
