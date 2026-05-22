import "server-only";

import type { Collection, Document } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";

import type { WishlistRepository } from "../wishlist-repository";
import type { WishlistRecord } from "../types";

const COLLECTION = "wishlists";

async function collection(): Promise<Collection<WishlistRecord & Document>> {
  const db = await getDb();
  const coll = db.collection<WishlistRecord & Document>(COLLECTION);
  await coll.createIndex({ userId: 1 }, { unique: true });
  return coll;
}

function nowIso(): string {
  return new Date().toISOString();
}

export class MongoWishlistRepository implements WishlistRepository {
  async listIds(userId: string): Promise<string[]> {
    const coll = await collection();
    const doc = await coll.findOne({ userId });
    return doc?.productIds ?? [];
  }

  async toggle(userId: string, productId: string): Promise<string[]> {
    const ids = await this.listIds(userId);
    if (ids.includes(productId)) {
      return this.remove(userId, productId);
    }
    return this.add(userId, productId);
  }

  async add(userId: string, productId: string): Promise<string[]> {
    const coll = await collection();
    await coll.updateOne(
      { userId },
      {
        $addToSet: { productIds: productId },
        $set: { updatedAt: nowIso() },
        $setOnInsert: { userId },
      },
      { upsert: true },
    );
    return this.listIds(userId);
  }

  async remove(userId: string, productId: string): Promise<string[]> {
    const coll = await collection();
    await coll.updateOne({ userId }, [
      {
        $set: {
          productIds: {
            $filter: {
              input: { $ifNull: ["$productIds", []] },
              as: "id",
              cond: { $ne: ["$$id", productId] },
            },
          },
          updatedAt: nowIso(),
        },
      },
    ]);
    return this.listIds(userId);
  }

  async clear(userId: string): Promise<void> {
    const coll = await collection();
    await coll.updateOne(
      { userId },
      { $set: { productIds: [], updatedAt: nowIso() } },
      { upsert: true },
    );
  }
}
