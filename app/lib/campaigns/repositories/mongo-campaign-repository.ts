import "server-only";

import { randomUUID } from "node:crypto";
import type { Collection, Document } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";

import type {
  CampaignRepository,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "../campaign-repository";
import { isCampaignLive, type Campaign } from "../types";

const COLLECTION = "campaigns";

async function collection(): Promise<Collection<Campaign & Document>> {
  const db = await getDb();
  const coll = db.collection<Campaign & Document>(COLLECTION);
  await coll.createIndex({ id: 1 }, { unique: true });
  await coll.createIndex({ enabled: 1 });

  // `partialFilterExpression` and `sparse` are mutually exclusive in Mongo;
  // the partial filter already excludes docs without a string promoCode.
  try {
    await coll.createIndex(
      { promoCode: 1 },
      {
        unique: true,
        partialFilterExpression: {
          promoCode: { $exists: true, $type: "string" },
        },
      },
    );
  } catch (error: unknown) {
    // An older deployment created this index with `sparse: true` which
    // conflicts with the partial filter. Drop the legacy index and recreate.
    const message = error instanceof Error ? error.message : String(error);
    if (/sparse|IndexOptionsConflict|already exists/i.test(message)) {
      try {
        await coll.dropIndex("promoCode_1");
        await coll.createIndex(
          { promoCode: 1 },
          {
            unique: true,
            partialFilterExpression: {
              promoCode: { $exists: true, $type: "string" },
            },
          },
        );
      } catch (innerError: unknown) {
        const m =
          innerError instanceof Error ? innerError.message : String(innerError);
        console.warn(
          "[campaigns] could not rebuild promoCode index — continuing without it:",
          m,
        );
      }
    } else {
      throw error;
    }
  }

  return coll;
}

function strip(record: Campaign & { _id?: unknown }): Campaign {
  // Explicit whitelist — guarantees Mongo's ObjectId (`_id`) and any other
  // driver-attached fields never leak through to client components.
  return {
    id: record.id,
    name: record.name,
    headerText: record.headerText,
    modalTitle: record.modalTitle,
    modalBody: record.modalBody,
    ctaLabel: record.ctaLabel,
    ctaHref: record.ctaHref,
    promoCode: record.promoCode,
    discount: record.discount
      ? {
          type: record.discount.type,
          value: record.discount.value,
          minSubtotalCents: record.discount.minSubtotalCents,
        }
      : undefined,
    showInHeader: Boolean(record.showInHeader),
    showModal: Boolean(record.showModal),
    enabled: Boolean(record.enabled),
    startsAt: record.startsAt,
    endsAt: record.endsAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class MongoCampaignRepository implements CampaignRepository {
  async list(): Promise<Campaign[]> {
    const coll = await collection();
    const docs = await coll.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map(strip);
  }

  async listActive(now = new Date()): Promise<Campaign[]> {
    const all = await this.list();
    return all.filter((c) => isCampaignLive(c, now));
  }

  async findById(id: string): Promise<Campaign | null> {
    const coll = await collection();
    const doc = await coll.findOne({ id });
    return doc ? strip(doc) : null;
  }

  async findByPromoCode(
    code: string,
    now = new Date(),
  ): Promise<Campaign | null> {
    const normalised = code.trim().toUpperCase();
    if (normalised.length === 0) return null;
    const coll = await collection();
    const doc = await coll.findOne({ promoCode: normalised });
    if (!doc) return null;
    const campaign = strip(doc);
    return isCampaignLive(campaign, now) ? campaign : null;
  }

  async create(input: CreateCampaignInput): Promise<Campaign> {
    const coll = await collection();
    const now = new Date().toISOString();
    const record: Campaign = {
      id: randomUUID(),
      ...input,
      promoCode: input.promoCode ? input.promoCode.toUpperCase() : undefined,
      createdAt: now,
      updatedAt: now,
    };
    // `insertOne` mutates `record` to attach a Mongo `_id`. Re-strip before
    // returning so client components never see the ObjectId.
    await coll.insertOne(record);
    return strip(record);
  }

  async update(
    id: string,
    input: UpdateCampaignInput,
  ): Promise<Campaign | null> {
    const coll = await collection();
    const existing = await coll.findOne({ id });
    if (!existing) return null;
    const next: Campaign = {
      ...strip(existing),
      ...input,
      promoCode: input.promoCode
        ? input.promoCode.toUpperCase()
        : input.promoCode === ""
          ? undefined
          : existing.promoCode,
      updatedAt: new Date().toISOString(),
    };
    await coll.replaceOne({ id }, next);
    // Re-strip in case the driver attaches anything during the round-trip.
    return strip(next);
  }

  async delete(id: string): Promise<boolean> {
    const coll = await collection();
    const result = await coll.deleteOne({ id });
    return result.deletedCount === 1;
  }
}
