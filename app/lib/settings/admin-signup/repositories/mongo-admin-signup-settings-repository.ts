import "server-only";

import type { Collection, Document } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";

import type { AdminSignupSettingsRepository } from "../repository";
import {
  DEFAULT_ADMIN_SIGNUP_SETTINGS,
  type AdminSignupSettings,
} from "../types";

const COLLECTION = "app_settings";
const SINGLETON_KEY = "admin-signup";

interface AdminSignupSettingsDoc extends AdminSignupSettings, Document {
  key: string;
}

async function collection(): Promise<Collection<AdminSignupSettingsDoc>> {
  const db = await getDb();
  const coll = db.collection<AdminSignupSettingsDoc>(COLLECTION);
  await coll.createIndex({ key: 1 }, { unique: true });
  return coll;
}

function strip(
  doc: AdminSignupSettingsDoc & { _id?: unknown },
): AdminSignupSettings {
  const { _id, key, ...rest } = doc;
  void _id;
  void key;
  return {
    enabled: rest.enabled,
    inviteCode: rest.inviteCode ?? "",
    updatedAt: rest.updatedAt,
  };
}

export class MongoAdminSignupSettingsRepository
  implements AdminSignupSettingsRepository
{
  async get(): Promise<AdminSignupSettings> {
    const coll = await collection();
    const doc = await coll.findOne({ key: SINGLETON_KEY });
    if (!doc) return DEFAULT_ADMIN_SIGNUP_SETTINGS;
    return strip(doc);
  }

  async update(
    input: Omit<AdminSignupSettings, "updatedAt">,
  ): Promise<AdminSignupSettings> {
    const coll = await collection();
    const next: AdminSignupSettings = {
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
