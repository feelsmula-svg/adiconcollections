import "server-only";

import { randomUUID } from "node:crypto";
import type { Collection, Document } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";

import {
  DuplicateHairTypeError,
  type CreateHairTypeInput,
  type HairTypeRepository,
  type UpdateHairTypeInput,
} from "../hair-type-repository";
import type { HairType } from "../types";

const COLLECTION = "hair_types";

function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function collection(): Promise<Collection<HairType & Document>> {
  const db = await getDb();
  const coll = db.collection<HairType & Document>(COLLECTION);
  await Promise.all([
    coll.createIndex({ id: 1 }, { unique: true }),
    coll.createIndex({ slug: 1 }, { unique: true }),
  ]);
  return coll;
}

function strip(record: HairType & { _id?: unknown }): HairType {
  const { _id, ...rest } = record;
  void _id;
  return rest;
}

export class MongoHairTypeRepository implements HairTypeRepository {
  async list(): Promise<HairType[]> {
    const coll = await collection();
    const docs = await coll.find({}).toArray();
    return docs.map(strip).sort((a, b) => a.label.localeCompare(b.label));
  }

  async findById(id: string): Promise<HairType | null> {
    const coll = await collection();
    const doc = await coll.findOne({ id });
    return doc ? strip(doc) : null;
  }

  async findBySlug(slug: string): Promise<HairType | null> {
    const coll = await collection();
    const doc = await coll.findOne({ slug: normalizeSlug(slug) });
    return doc ? strip(doc) : null;
  }

  async create(input: CreateHairTypeInput): Promise<HairType> {
    const coll = await collection();
    const slug = normalizeSlug(input.slug);
    const existing = await coll.findOne({ slug });
    if (existing) throw new DuplicateHairTypeError(slug);
    const now = new Date().toISOString();
    const record: HairType = {
      id: randomUUID(),
      slug,
      label: input.label.trim(),
      description: input.description?.trim() ?? "",
      category: input.category,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await coll.insertOne(record);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: number }).code === 11000
      ) {
        throw new DuplicateHairTypeError(slug);
      }
      throw error;
    }
    return record;
  }

  async update(
    id: string,
    input: UpdateHairTypeInput,
  ): Promise<HairType | null> {
    const coll = await collection();
    const existing = await coll.findOne({ id });
    if (!existing) return null;
    const nextSlug = input.slug ? normalizeSlug(input.slug) : existing.slug;
    if (nextSlug !== existing.slug) {
      const clash = await coll.findOne({ slug: nextSlug });
      if (clash) throw new DuplicateHairTypeError(nextSlug);
    }
    const updated: HairType = {
      ...strip(existing),
      slug: nextSlug,
      label: input.label?.trim() ?? existing.label,
      description: input.description?.trim() ?? existing.description,
      category: input.category ?? existing.category,
      updatedAt: new Date().toISOString(),
    };
    await coll.replaceOne({ id }, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const coll = await collection();
    const result = await coll.deleteOne({ id });
    return result.deletedCount === 1;
  }
}
