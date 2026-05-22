import "server-only";

import type {
  ContactMessage,
  ContactMessageReply,
  ContactMessageStatus,
} from "./types";

export interface CreateContactMessageInput {
  name: string;
  email: string;
  subject: string;
  body: string;
  userId?: string;
}

export interface AppendReplyInput {
  reply: Omit<ContactMessageReply, "id" | "createdAt">;
}

export interface ListContactMessagesFilters {
  status?: ContactMessageStatus;
}

export interface MessageRepository {
  create(input: CreateContactMessageInput): Promise<ContactMessage>;
  list(filters?: ListContactMessagesFilters): Promise<ContactMessage[]>;
  findById(id: string): Promise<ContactMessage | null>;
  appendReply(
    id: string,
    input: AppendReplyInput,
  ): Promise<ContactMessage | null>;
  updateStatus(
    id: string,
    status: ContactMessageStatus,
  ): Promise<ContactMessage | null>;
}

let repoPromise: Promise<MessageRepository> | null = null;

export async function getMessageRepository(): Promise<MessageRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      if (process.env.MONGO_DB_URL) {
        const { MongoMessageRepository } = await import(
          "./repositories/mongo-message-repository"
        );
        return new MongoMessageRepository();
      }
      const { JsonMessageRepository } = await import(
        "./repositories/json-message-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[messages] JsonMessageRepository is DEV-ONLY. Set MONGO_DB_URL to use the Mongo-backed repository.",
        );
      }
      return new JsonMessageRepository();
    })();
  }
  return repoPromise;
}
