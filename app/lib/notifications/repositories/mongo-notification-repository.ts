import "server-only";

import { randomUUID } from "node:crypto";
import type { Collection, Document, Filter } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";

import type {
  CreateNotificationInput,
  NotificationRepository,
} from "../notification-repository";
import type { AdminNotification } from "../types";

const COLLECTION = "admin_notifications";

// On-disk shape: legacy records may have `recipientUserId: null` because the
// driver historically serialized `undefined` as BSON null. The wider type
// lets the Filter API accept `{ recipientUserId: null }` queries.
type NotificationDoc = Omit<AdminNotification, "recipientUserId"> &
  Document & { recipientUserId?: string | null };

let _collectionPromise: Promise<Collection<NotificationDoc>> | null = null;

function collection(): Promise<Collection<NotificationDoc>> {
  if (!_collectionPromise) {
    _collectionPromise = (async () => {
      const db = await getDb();
      const coll = db.collection<NotificationDoc>(COLLECTION);
      await Promise.all([
        coll.createIndex({ id: 1 }, { unique: true }),
        coll.createIndex({ createdAt: -1 }),
      ]);
      return coll;
    })().catch((err) => { _collectionPromise = null; throw err; });
  }
  return _collectionPromise;
}

function strip(record: NotificationDoc & { _id?: unknown }): AdminNotification {
  const { _id, recipientUserId, ...rest } = record;
  void _id;
  return {
    ...rest,
    readBy: Array.isArray(rest.readBy) ? rest.readBy : [],
    ...(recipientUserId ? { recipientUserId } : {}),
  };
}

export class MongoNotificationRepository implements NotificationRepository {
  async create(input: CreateNotificationInput): Promise<AdminNotification> {
    const coll = await collection();
    const record: AdminNotification = {
      id: randomUUID(),
      kind: input.kind,
      title: input.title,
      createdAt: new Date().toISOString(),
      readBy: [],
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.link !== undefined ? { link: input.link } : {}),
      ...(input.recipientUserId !== undefined
        ? { recipientUserId: input.recipientUserId }
        : {}),
    };
    await coll.insertOne(record);
    return record;
  }

  async list(limit = 30): Promise<AdminNotification[]> {
    const coll = await collection();
    const docs = await coll
      // Equality with `null` matches both missing fields and explicit null
      // values, so older records that stored `recipientUserId: null` for
      // broadcasts still surface here. Cast: the driver's Filter type
      // narrows the widened field back to `string | undefined` for queries.
      .find({ recipientUserId: null } as Filter<NotificationDoc>)
      .sort({ createdAt: -1 })
      .limit(Math.min(Math.max(limit, 1), 200))
      .toArray();
    return docs.map(strip);
  }

  async listForUser(
    userId: string,
    limit = 30,
  ): Promise<AdminNotification[]> {
    const coll = await collection();
    const docs = await coll
      .find({ recipientUserId: userId })
      .sort({ createdAt: -1 })
      .limit(Math.min(Math.max(limit, 1), 200))
      .toArray();
    return docs.map(strip);
  }

  async countUnread(userId: string): Promise<number> {
    const coll = await collection();
    return coll.countDocuments({
      recipientUserId: null,
      readBy: { $ne: userId },
    } as Filter<NotificationDoc>);
  }

  async countUnreadForUser(userId: string): Promise<number> {
    const coll = await collection();
    return coll.countDocuments({
      recipientUserId: userId,
      readBy: { $ne: userId },
    });
  }

  async markRead(id: string, userId: string): Promise<void> {
    const coll = await collection();
    await coll.updateOne({ id }, { $addToSet: { readBy: userId } });
  }

  async markAllRead(userId: string): Promise<void> {
    const coll = await collection();
    await coll.updateMany(
      {
        recipientUserId: null,
        readBy: { $ne: userId },
      } as Filter<NotificationDoc>,
      { $addToSet: { readBy: userId } },
    );
  }

  async markAllReadForUser(userId: string): Promise<void> {
    const coll = await collection();
    await coll.updateMany(
      { recipientUserId: userId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } },
    );
  }
}
