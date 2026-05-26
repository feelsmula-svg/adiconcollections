import "server-only";

import type { Collection, Document } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";

import type {
  CreatePendingSignupInput,
  PendingSignupRepository,
} from "../pending-signup-repository";
import type { PendingSignupRecord } from "../types";

const COLLECTION = "pending_signups";

async function collection(): Promise<
  Collection<PendingSignupRecord & Document>
> {
  const db = await getDb();
  const coll = db.collection<PendingSignupRecord & Document>(COLLECTION);
  await coll.createIndex({ email: 1 }, { unique: true });
  return coll;
}

function strip(
  record: PendingSignupRecord & { _id?: unknown },
): PendingSignupRecord {
  const { _id, ...rest } = record;
  void _id;
  return rest;
}

export class MongoPendingSignupRepository implements PendingSignupRepository {
  async upsert(
    input: CreatePendingSignupInput,
  ): Promise<PendingSignupRecord> {
    const coll = await collection();
    const email = input.email.trim().toLowerCase();
    const now = new Date().toISOString();

    // Best-effort cleanup of expired entries (TTL-style sweep).
    await coll.deleteMany({ expiresAt: { $lt: now } });

    const record: PendingSignupRecord = {
      email,
      name: input.name.trim(),
      passwordHash: input.passwordHash,
      otpHash: input.otpHash,
      attempts: 0,
      createdAt: now,
      expiresAt: input.expiresAt,
      resendAvailableAt: input.resendAvailableAt,
    };
    await coll.replaceOne({ email }, record, { upsert: true });
    return strip(record);
  }

  async findByEmail(email: string): Promise<PendingSignupRecord | null> {
    const coll = await collection();
    const doc = await coll.findOne({ email: email.trim().toLowerCase() });
    if (!doc) return null;
    const entry = strip(doc);
    if (new Date(entry.expiresAt).getTime() <= Date.now()) return null;
    return entry;
  }

  async incrementAttempts(
    email: string,
  ): Promise<PendingSignupRecord | null> {
    const coll = await collection();
    const result = await coll.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { $inc: { attempts: 1 } },
      { returnDocument: "after" },
    );
    return result ? strip(result) : null;
  }

  async refreshOtp(
    email: string,
    otpHash: string,
    expiresAt: string,
    resendAvailableAt: string,
  ): Promise<PendingSignupRecord | null> {
    const coll = await collection();
    const result = await coll.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      {
        $set: {
          otpHash,
          attempts: 0,
          expiresAt,
          resendAvailableAt,
        },
      },
      { returnDocument: "after" },
    );
    return result ? strip(result) : null;
  }

  async delete(email: string): Promise<void> {
    const coll = await collection();
    await coll.deleteOne({ email: email.trim().toLowerCase() });
  }
}
