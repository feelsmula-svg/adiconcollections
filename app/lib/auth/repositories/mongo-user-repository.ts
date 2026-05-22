import "server-only";

import { randomUUID } from "node:crypto";
import type { Collection, Document } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";
import { sanitiseMongoRegex } from "@/app/lib/db/mongo-search";

import type {
  CreateUserInput,
  ListUsersFilters,
  UpdateUserProfileInput,
  UserRepository,
} from "../user-repository";
import type { AdminStatus, UserRecord, UserRole } from "../types";

const COLLECTION = "users";

export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`A user with email "${email}" already exists`);
    this.name = "DuplicateEmailError";
  }
}

async function collection(): Promise<Collection<UserRecord & Document>> {
  const db = await getDb();
  const coll = db.collection<UserRecord & Document>(COLLECTION);
  await Promise.all([
    coll.createIndex({ id: 1 }, { unique: true }),
    coll.createIndex({ email: 1 }, { unique: true }),
  ]);
  return coll;
}

function strip(record: UserRecord & { _id?: unknown }): UserRecord {
  const { _id, ...rest } = record;
  void _id;
  return {
    ...rest,
    role: (rest.role as UserRole | undefined) ?? "customer",
  };
}

export class MongoUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const coll = await collection();
    const doc = await coll.findOne({ email: email.trim().toLowerCase() });
    return doc ? strip(doc) : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const coll = await collection();
    const doc = await coll.findOne({ id });
    return doc ? strip(doc) : null;
  }

  async list(filters: ListUsersFilters = {}): Promise<UserRecord[]> {
    const coll = await collection();
    const query: Record<string, unknown> = {};
    if (filters.role) query.role = filters.role;
    if (filters.adminStatus) query.adminStatus = filters.adminStatus;
    if (filters.q?.trim()) {
      const q = sanitiseMongoRegex(filters.q.trim());
      query.$or = [
        { email: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ];
    }
    const docs = await coll.find(query).toArray();
    return docs.map(strip);
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    const coll = await collection();
    const email = input.email.trim().toLowerCase();
    const existing = await coll.findOne({ email });
    if (existing) throw new DuplicateEmailError(email);
    const role = input.role ?? "customer";
    const record: UserRecord = {
      id: randomUUID(),
      email,
      name: input.name.trim(),
      role,
      passwordHash: input.passwordHash,
      createdAt: new Date().toISOString(),
      ...(role === "admin"
        ? { adminStatus: input.adminStatus ?? "approved" }
        : {}),
    };
    try {
      await coll.insertOne(record);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: number }).code === 11000
      ) {
        throw new DuplicateEmailError(email);
      }
      throw error;
    }
    return record;
  }

  async updatePassword(
    id: string,
    passwordHash: string,
  ): Promise<UserRecord | null> {
    const coll = await collection();
    const result = await coll.findOneAndUpdate(
      { id },
      { $set: { passwordHash } },
      { returnDocument: "after" },
    );
    return result ? strip(result) : null;
  }

  async updateRole(id: string, role: UserRole): Promise<UserRecord | null> {
    const coll = await collection();
    const update: Record<string, unknown> =
      role === "admin"
        ? { $set: { role, adminStatus: "approved" } }
        : { $set: { role }, $unset: { adminStatus: "" } };
    const result = await coll.findOneAndUpdate({ id }, update, {
      returnDocument: "after",
    });
    return result ? strip(result) : null;
  }

  async updateAdminStatus(
    id: string,
    status: AdminStatus,
  ): Promise<UserRecord | null> {
    const coll = await collection();
    const result = await coll.findOneAndUpdate(
      { id, role: "admin" },
      { $set: { adminStatus: status } },
      { returnDocument: "after" },
    );
    return result ? strip(result) : null;
  }

  async countAdmins(approvedOnly = false): Promise<number> {
    const coll = await collection();
    const query: Record<string, unknown> = { role: "admin" };
    if (approvedOnly) query.adminStatus = "approved";
    return coll.countDocuments(query);
  }

  async findPrimaryAdmin(): Promise<UserRecord | null> {
    const coll = await collection();
    const doc = await coll
      .find({ role: "admin", adminStatus: "approved" })
      .sort({ createdAt: 1 })
      .limit(1)
      .next();
    if (doc) return strip(doc);
    // Fallback: earliest admin regardless of approval status (covers legacy data).
    const legacy = await coll
      .find({ role: "admin" })
      .sort({ createdAt: 1 })
      .limit(1)
      .next();
    return legacy ? strip(legacy) : null;
  }

  async delete(id: string): Promise<boolean> {
    const coll = await collection();
    const result = await coll.deleteOne({ id });
    return result.deletedCount === 1;
  }

  async updateProfile(
    id: string,
    input: UpdateUserProfileInput,
  ): Promise<UserRecord | null> {
    const coll = await collection();
    const set: Record<string, unknown> = {};
    const unset: Record<string, "" > = {};
    if (typeof input.name === "string") {
      const trimmed = input.name.trim();
      if (trimmed.length > 0) set.name = trimmed;
    }
    if (input.phone === null) {
      unset.phone = "";
    } else if (typeof input.phone === "string") {
      const trimmed = input.phone.trim();
      if (trimmed.length === 0) {
        unset.phone = "";
      } else {
        set.phone = trimmed;
      }
    }
    const update: Record<string, unknown> = {};
    if (Object.keys(set).length > 0) update.$set = set;
    if (Object.keys(unset).length > 0) update.$unset = unset;
    if (Object.keys(update).length === 0) {
      const existing = await coll.findOne({ id });
      return existing ? strip(existing) : null;
    }
    const result = await coll.findOneAndUpdate({ id }, update, {
      returnDocument: "after",
    });
    return result ? strip(result) : null;
  }
}
