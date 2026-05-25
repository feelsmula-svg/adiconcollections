import "server-only";

import { randomUUID } from "node:crypto";
import type { Collection, Document } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";

import type {
  AppendReplyInput,
  CreateContactMessageInput,
  ListContactMessagesFilters,
  MessageRepository,
} from "../message-repository";
import type {
  ContactMessage,
  ContactMessageStatus,
} from "../types";

const COLLECTION = "contact_messages";

async function collection(): Promise<Collection<ContactMessage & Document>> {
  const db = await getDb();
  const coll = db.collection<ContactMessage & Document>(COLLECTION);
  await Promise.all([
    coll.createIndex({ id: 1 }, { unique: true }),
    coll.createIndex({ createdAt: -1 }),
    coll.createIndex({ status: 1 }),
  ]);
  return coll;
}

function strip(record: ContactMessage & { _id?: unknown }): ContactMessage {
  const { _id, ...rest } = record;
  void _id;
  return {
    ...rest,
    replies: Array.isArray(rest.replies) ? rest.replies : [],
  };
}

export class MongoMessageRepository implements MessageRepository {
  async create(input: CreateContactMessageInput): Promise<ContactMessage> {
    const coll = await collection();
    const record: ContactMessage = {
      id: randomUUID(),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      subject: input.subject.trim(),
      body: input.body.trim(),
      userId: input.userId,
      status: "new",
      createdAt: new Date().toISOString(),
      replies: [],
    };
    // `insertOne` mutates `record` to attach a Mongo `_id`. Re-strip before
    // returning so client components never see the ObjectId.
    await coll.insertOne(record);
    return strip(record);
  }

  async list(
    filters: ListContactMessagesFilters = {},
  ): Promise<ContactMessage[]> {
    const coll = await collection();
    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;
    const docs = await coll
      .find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();
    return docs.map(strip);
  }

  async findById(id: string): Promise<ContactMessage | null> {
    const coll = await collection();
    const doc = await coll.findOne({ id });
    return doc ? strip(doc) : null;
  }

  async appendReply(
    id: string,
    input: AppendReplyInput,
  ): Promise<ContactMessage | null> {
    const coll = await collection();
    const reply = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...input.reply,
    };
    const update = {
      $push: { replies: reply },
      $set: { status: "replied" satisfies ContactMessageStatus },
    } as unknown as Parameters<typeof coll.findOneAndUpdate>[1];
    const result = await coll.findOneAndUpdate({ id }, update, {
      returnDocument: "after",
    });
    return result ? strip(result) : null;
  }

  async updateStatus(
    id: string,
    status: ContactMessageStatus,
  ): Promise<ContactMessage | null> {
    const coll = await collection();
    const result = await coll.findOneAndUpdate(
      { id },
      { $set: { status } },
      { returnDocument: "after" },
    );
    return result ? strip(result) : null;
  }
}
