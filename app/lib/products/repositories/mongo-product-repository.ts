import "server-only";

import { randomUUID } from "node:crypto";
import type { Collection, Document } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";
import { sanitiseMongoRegex } from "@/app/lib/db/mongo-search";

import type {
  CreateProductInput,
  ProductRepository,
  UpdateProductInput,
} from "../product-repository";
import type { ListProductsFilters, ProductRecord } from "../types";

const COLLECTION = "products";

let _collectionPromise: Promise<Collection<ProductRecord & Document>> | null = null;

function collection(): Promise<Collection<ProductRecord & Document>> {
  if (!_collectionPromise) {
    _collectionPromise = (async () => {
      const db = await getDb();
      const coll = db.collection<ProductRecord & Document>(COLLECTION);
      await coll.createIndex({ id: 1 }, { unique: true });
      return coll;
    })().catch((err) => { _collectionPromise = null; throw err; });
  }
  return _collectionPromise;
}

function strip(record: ProductRecord & { _id?: unknown }): ProductRecord {
  const { _id, ...rest } = record;
  void _id;
  return rest;
}

/** Keep a positive discount, otherwise drop the field entirely. */
function normalizeDiscount(value: number | undefined): number | undefined {
  return typeof value === "number" && value > 0 ? value : undefined;
}

export class MongoProductRepository implements ProductRepository {
  async list(filters: ListProductsFilters = {}): Promise<ProductRecord[]> {
    const coll = await collection();
    const query: Record<string, unknown> = {};
    if (filters.category) query.category = filters.category;
    if (typeof filters.featured === "boolean") query.featured = filters.featured;
    if (filters.q?.trim()) {
      const q = sanitiseMongoRegex(filters.q.trim());
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { type: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }
    // Grid/list callers pass `summary` to exclude the base64 `images` gallery,
    // which can be several MB per product. The primary `imageUrl` is kept so
    // cards still render their thumbnail; detail pages use `findById` for the
    // full gallery.
    const options = filters.summary
      ? { projection: { images: 0 } }
      : undefined;
    const docs = await coll
      .find(query, options)
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map(strip);
  }

  async findById(id: string): Promise<ProductRecord | null> {
    const coll = await collection();
    const doc = await coll.findOne({ id });
    return doc ? strip(doc) : null;
  }

  async create(input: CreateProductInput): Promise<ProductRecord> {
    const coll = await collection();
    const now = new Date().toISOString();
    const trimmedImages = input.images?.map((src) => src.trim()).filter(
      (src) => src.length > 0,
    );
    const primaryImage = (trimmedImages?.[0] ?? input.imageUrl).trim();
    const record: ProductRecord = {
      id: randomUUID(),
      name: input.name.trim(),
      description: input.description.trim(),
      category: input.category,
      type: input.type.trim(),
      priceCents: input.priceCents,
      discountPercent:
        input.discountPercent && input.discountPercent > 0
          ? input.discountPercent
          : undefined,
      imageUrl: primaryImage,
      images:
        trimmedImages && trimmedImages.length > 0
          ? trimmedImages
          : primaryImage
            ? [primaryImage]
            : undefined,
      stock: input.stock,
      featured: input.featured ?? false,
      badge: input.badge,
      lengthOptions: input.lengthOptions,
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
    input: UpdateProductInput,
  ): Promise<ProductRecord | null> {
    const coll = await collection();
    const existing = await coll.findOne({ id });
    if (!existing) return null;
    const existingRecord = strip(existing);
    const inputImages = input.images?.map((src) => src.trim()).filter(
      (src) => src.length > 0,
    );
    const nextImages = inputImages ?? existingRecord.images;
    const nextPrimary =
      input.imageUrl?.trim() ?? nextImages?.[0] ?? existingRecord.imageUrl;
    const updated: ProductRecord = {
      ...existingRecord,
      name: input.name?.trim() ?? existingRecord.name,
      description: input.description?.trim() ?? existingRecord.description,
      category: input.category ?? existingRecord.category,
      type: input.type?.trim() ?? existingRecord.type,
      priceCents: input.priceCents ?? existingRecord.priceCents,
      discountPercent: normalizeDiscount(
        input.discountPercent ?? existingRecord.discountPercent,
      ),
      imageUrl: nextPrimary,
      images: nextImages,
      stock: input.stock ?? existingRecord.stock,
      featured: input.featured ?? existingRecord.featured,
      badge: input.badge ?? existingRecord.badge,
      lengthOptions: input.lengthOptions ?? existingRecord.lengthOptions,
      updatedAt: new Date().toISOString(),
    };
    await coll.replaceOne({ id }, updated);
    // Re-strip in case the driver attaches anything during the round-trip.
    return strip(updated);
  }

  async delete(id: string): Promise<boolean> {
    const coll = await collection();
    const result = await coll.deleteOne({ id });
    return result.deletedCount === 1;
  }
}
