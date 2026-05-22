import "server-only";

import { randomUUID } from "node:crypto";
import type { Collection, Document } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";

import type {
  CreateNotificationInput,
  NotificationRepository,
} from "../notification-repository";
import type { AdminNotification } from "../types";

const COLLECTION = "admin_notifications";

async function collection(): Promise<
  Collection<AdminNotification & Document>
> {
  const db = await getDb();
  const coll = db.collection<AdminNotification & Document>(COLLECTION);
  await Promise.all([
    coll.createIndex({ id: 1 }, { unique: true }),
    coll.createIndex({ createdAt: -1 }),
  ]);
  return coll;
}

function strip(
  record: AdminNotification & { _id?: unknown },
): AdminNotification {
  const { _id, ...rest } = record;
  void _id;
  return {
    ...rest,
    readBy: Array.isArray(rest.readBy) ? rest.readBy : [],
  };
}

export class MongoNotificationRepository implements NotificationRepository {
  async create(input: CreateNotificationInput): Promise<AdminNotification> {
    const coll = await collection();
    const record: AdminNotification = {
      id: randomUUID(),
      kind: input.kind,
      title: input.title,
      body: input.body,
      link: input.link,
      recipientUserId: input.recipientUserId,
      createdAt: new Date().toISOString(),
      readBy: [],
    };
    await coll.insertOne(record);
    return record;
  }

  async list(limit = 30): Promise<AdminNotification[]> {
    const coll = await collection();
    const docs = await coll
      .find({ recipientUserId: { $exists: false } })
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
      recipientUserId: { $exists: false },
      readBy: { $ne: userId },
    });
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
        recipientUserId: { $exists: false },
        readBy: { $ne: userId },
      },
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
