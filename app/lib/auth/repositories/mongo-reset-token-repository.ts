import "server-only";

import type { Collection, Document } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";

import type {
  CreateResetTokenInput,
  ResetTokenRepository,
} from "../reset-token-repository";
import type { PasswordResetRecord } from "../types";

const COLLECTION = "password_resets";

async function collection(): Promise<
  Collection<PasswordResetRecord & Document>
> {
  const db = await getDb();
  const coll = db.collection<PasswordResetRecord & Document>(COLLECTION);
  await coll.createIndex({ tokenHash: 1 }, { unique: true });
  return coll;
}

function strip(
  record: PasswordResetRecord & { _id?: unknown },
): PasswordResetRecord {
  const { _id, ...rest } = record;
  void _id;
  return rest;
}

export class MongoResetTokenRepository implements ResetTokenRepository {
  async create(input: CreateResetTokenInput): Promise<PasswordResetRecord> {
    const coll = await collection();
    const now = new Date().toISOString();
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // Best-effort cleanup of expired/old rows before issuing a new one.
    await coll.deleteMany({
      $or: [
        { expiresAt: { $lt: now } },
        { createdAt: { $lt: sevenDaysAgo } },
      ],
    });

    const record: PasswordResetRecord = {
      tokenHash: input.tokenHash,
      userId: input.userId,
      email: input.email,
      createdAt: now,
      expiresAt: input.expiresAt,
    };
    // `insertOne` mutates `record` to attach a Mongo `_id`. Re-strip before
    // returning so client components never see the ObjectId.
    await coll.insertOne(record);
    return strip(record);
  }

  async findActiveByHash(
    tokenHash: string,
  ): Promise<PasswordResetRecord | null> {
    const coll = await collection();
    const doc = await coll.findOne({ tokenHash });
    if (!doc) return null;
    const entry = strip(doc);
    if (entry.consumedAt) return null;
    if (new Date(entry.expiresAt).getTime() <= Date.now()) return null;
    return entry;
  }

  async consume(tokenHash: string): Promise<void> {
    const coll = await collection();
    await coll.updateOne(
      { tokenHash, consumedAt: { $exists: false } },
      { $set: { consumedAt: new Date().toISOString() } },
    );
  }

  async consumeAllForUser(userId: string): Promise<void> {
    const coll = await collection();
    await coll.updateMany(
      { userId, consumedAt: { $exists: false } },
      { $set: { consumedAt: new Date().toISOString() } },
    );
  }
}
