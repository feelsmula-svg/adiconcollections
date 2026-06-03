import "server-only";

import { randomUUID } from "node:crypto";
import type { Collection, Document } from "mongodb";

import {
  SYSTEM_PRODUCT_CATEGORIES,
  SYSTEM_PRODUCT_CATEGORY_LABEL,
} from "@/app/lib/products/types";
import { getDb } from "@/app/lib/db/mongo";

import {
  DuplicateCategoryError,
  ProtectedCategoryError,
  type CategoryRepository,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "../category-repository";
import type { CategoryRecord } from "../types";

const COLLECTION = "categories";

function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

let _collectionPromise: Promise<Collection<CategoryRecord & Document>> | null = null;

function collection(): Promise<Collection<CategoryRecord & Document>> {
  if (!_collectionPromise) {
    _collectionPromise = (async () => {
      const db = await getDb();
      const coll = db.collection<CategoryRecord & Document>(COLLECTION);
      await Promise.all([
        coll.createIndex({ id: 1 }, { unique: true }),
        coll.createIndex({ slug: 1 }, { unique: true }),
      ]);
      await ensureSystemSeeds(coll);
      return coll;
    })().catch((err) => { _collectionPromise = null; throw err; });
  }
  return _collectionPromise;
}

async function ensureSystemSeeds(
  coll: Collection<CategoryRecord & Document>,
): Promise<void> {
  const now = new Date().toISOString();
  const ops = SYSTEM_PRODUCT_CATEGORIES.map((slug) => ({
    updateOne: {
      filter: { slug },
      update: {
        $setOnInsert: {
          id: `system:${slug}`,
          slug,
          label: SYSTEM_PRODUCT_CATEGORY_LABEL[slug],
          description: "",
          createdAt: now,
          updatedAt: now,
        },
        $set: { isSystem: true },
      },
      upsert: true,
    },
  }));
  if (ops.length > 0) await coll.bulkWrite(ops);
}

function strip(
  record: CategoryRecord & { _id?: unknown },
): CategoryRecord {
  const { _id, ...rest } = record;
  void _id;
  return rest;
}

export class MongoCategoryRepository implements CategoryRepository {
  async list(): Promise<CategoryRecord[]> {
    const coll = await collection();
    const docs = await coll.find({}).toArray();
    return docs.map(strip).sort((a, b) => {
      if (a.isSystem !== b.isSystem) return a.isSystem ? -1 : 1;
      return a.label.localeCompare(b.label);
    });
  }

  async findById(id: string): Promise<CategoryRecord | null> {
    const coll = await collection();
    const doc = await coll.findOne({ id });
    return doc ? strip(doc) : null;
  }

  async findBySlug(slug: string): Promise<CategoryRecord | null> {
    const coll = await collection();
    const doc = await coll.findOne({ slug: normalizeSlug(slug) });
    return doc ? strip(doc) : null;
  }

  async create(input: CreateCategoryInput): Promise<CategoryRecord> {
    const coll = await collection();
    const slug = normalizeSlug(input.slug);
    if (slug.length === 0) throw new DuplicateCategoryError(slug);
    const existing = await coll.findOne({ slug });
    if (existing) throw new DuplicateCategoryError(slug);
    const now = new Date().toISOString();
    const record: CategoryRecord = {
      id: randomUUID(),
      slug,
      label: input.label.trim(),
      description: input.description?.trim() ?? "",
      isSystem: false,
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
        throw new DuplicateCategoryError(slug);
      }
      throw error;
    }
    // `insertOne` mutates `record` to attach a Mongo `_id`. Re-strip before
    // returning so client components never see the ObjectId.
    return strip(record);
  }

  async update(
    id: string,
    input: UpdateCategoryInput,
  ): Promise<CategoryRecord | null> {
    const coll = await collection();
    const existing = await coll.findOne({ id });
    if (!existing) return null;
    const updated: CategoryRecord = {
      ...strip(existing),
      label: input.label?.trim() ?? existing.label,
      description: input.description?.trim() ?? existing.description,
      updatedAt: new Date().toISOString(),
    };
    await coll.replaceOne({ id }, updated);
    // Re-strip in case the driver attaches anything during the round-trip.
    return strip(updated);
  }

  async delete(id: string): Promise<boolean> {
    const coll = await collection();
    const target = await coll.findOne({ id });
    if (!target) return false;
    if (target.isSystem) throw new ProtectedCategoryError(target.slug);
    const result = await coll.deleteOne({ id });
    return result.deletedCount === 1;
  }
}
