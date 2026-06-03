import "server-only";

import type { Collection, Document } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";

import type { ShippingSettingsRepository } from "../shipping-settings-repository";
import {
  DEFAULT_SHIPPING_SETTINGS,
  type ShippingMethodConfig,
  type ShippingSettings,
} from "../types";

const COLLECTION = "app_settings";
const SINGLETON_KEY = "shipping";

interface ShippingSettingsDoc extends ShippingSettings, Document {
  key: string;
}

let _collectionPromise: Promise<Collection<ShippingSettingsDoc>> | null = null;

function collection(): Promise<Collection<ShippingSettingsDoc>> {
  if (!_collectionPromise) {
    _collectionPromise = (async () => {
      const db = await getDb();
      const coll = db.collection<ShippingSettingsDoc>(COLLECTION);
      await coll.createIndex({ key: 1 }, { unique: true });
      return coll;
    })().catch((err) => { _collectionPromise = null; throw err; });
  }
  return _collectionPromise;
}

function method(
  input: Partial<ShippingMethodConfig> | undefined,
  fallback: ShippingMethodConfig,
): ShippingMethodConfig {
  return {
    label: input?.label ?? fallback.label,
    description: input?.description ?? fallback.description,
    priceCents:
      typeof input?.priceCents === "number"
        ? input.priceCents
        : fallback.priceCents,
  };
}

function strip(doc: ShippingSettingsDoc & { _id?: unknown }): ShippingSettings {
  const { _id, key, ...rest } = doc;
  void _id;
  void key;
  return {
    sameDay: method(rest.sameDay, DEFAULT_SHIPPING_SETTINGS.sameDay),
    standard: method(rest.standard, DEFAULT_SHIPPING_SETTINGS.standard),
    taxRate:
      typeof rest.taxRate === "number"
        ? rest.taxRate
        : DEFAULT_SHIPPING_SETTINGS.taxRate,
    updatedAt: rest.updatedAt ?? DEFAULT_SHIPPING_SETTINGS.updatedAt,
  };
}

export class MongoShippingSettingsRepository
  implements ShippingSettingsRepository
{
  async get(): Promise<ShippingSettings> {
    const coll = await collection();
    const doc = await coll.findOne({ key: SINGLETON_KEY });
    if (!doc) return DEFAULT_SHIPPING_SETTINGS;
    return strip(doc);
  }

  async update(
    input: Omit<ShippingSettings, "updatedAt">,
  ): Promise<ShippingSettings> {
    const coll = await collection();
    const next: ShippingSettings = {
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
