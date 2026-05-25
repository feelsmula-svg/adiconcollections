import "server-only";

import { randomUUID } from "node:crypto";
import type { Collection, Document } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";

import type { AddressRepository } from "../address-repository";
import type { AddressInput, AddressRecord } from "../types";

const COLLECTION = "addresses";

async function collection(): Promise<Collection<AddressRecord & Document>> {
  const db = await getDb();
  const coll = db.collection<AddressRecord & Document>(COLLECTION);
  await Promise.all([
    coll.createIndex({ id: 1 }, { unique: true }),
    coll.createIndex({ userId: 1 }),
  ]);
  return coll;
}

function strip(record: AddressRecord & { _id?: unknown }): AddressRecord {
  const { _id, ...rest } = record;
  void _id;
  return rest;
}

function normalise(
  userId: string,
  id: string,
  input: AddressInput,
  createdAt: string,
): AddressRecord {
  const line2 = input.line2?.trim();
  const phone = input.phone?.trim();
  return {
    id,
    userId,
    name: input.name.trim(),
    line1: input.line1.trim(),
    line2: line2 && line2.length > 0 ? line2 : undefined,
    city: input.city.trim(),
    state: input.state.trim(),
    postal: input.postal.trim(),
    country: input.country.trim(),
    phone: phone && phone.length > 0 ? phone : undefined,
    isDefaultShipping: input.isDefaultShipping ?? false,
    isDefaultBilling: input.isDefaultBilling ?? false,
    createdAt,
  };
}

export class MongoAddressRepository implements AddressRepository {
  async listForUser(userId: string): Promise<AddressRecord[]> {
    const coll = await collection();
    const docs = await coll
      .find({ userId })
      .sort({ createdAt: 1 })
      .toArray();
    return docs.map(strip);
  }

  async findById(id: string, userId: string): Promise<AddressRecord | null> {
    const coll = await collection();
    const doc = await coll.findOne({ id, userId });
    return doc ? strip(doc) : null;
  }

  async create(userId: string, input: AddressInput): Promise<AddressRecord> {
    const coll = await collection();
    const record = normalise(
      userId,
      randomUUID(),
      input,
      new Date().toISOString(),
    );
    await this.clearDefaultsIfNeeded(coll, userId, record);
    // `insertOne` mutates `record` to attach a Mongo `_id`. Re-strip before
    // returning so client components never see the ObjectId.
    await coll.insertOne(record);
    return strip(record);
  }

  async update(
    id: string,
    userId: string,
    input: AddressInput,
  ): Promise<AddressRecord | null> {
    const coll = await collection();
    const existing = await coll.findOne({ id, userId });
    if (!existing) return null;
    const record = normalise(userId, id, input, existing.createdAt);
    await this.clearDefaultsIfNeeded(coll, userId, record);
    await coll.replaceOne({ id, userId }, record);
    // Re-strip in case the driver attaches anything during the round-trip.
    return strip(record);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const coll = await collection();
    const result = await coll.deleteOne({ id, userId });
    return result.deletedCount === 1;
  }

  private async clearDefaultsIfNeeded(
    coll: Collection<AddressRecord & Document>,
    userId: string,
    record: AddressRecord,
  ): Promise<void> {
    const updates: Promise<unknown>[] = [];
    if (record.isDefaultShipping) {
      updates.push(
        coll.updateMany(
          { userId, id: { $ne: record.id }, isDefaultShipping: true },
          { $set: { isDefaultShipping: false } },
        ),
      );
    }
    if (record.isDefaultBilling) {
      updates.push(
        coll.updateMany(
          { userId, id: { $ne: record.id }, isDefaultBilling: true },
          { $set: { isDefaultBilling: false } },
        ),
      );
    }
    if (updates.length > 0) {
      await Promise.all(updates);
    }
  }
}
