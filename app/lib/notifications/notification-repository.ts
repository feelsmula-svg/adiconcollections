import "server-only";

import type { AdminNotification, NotificationKind } from "./types";

export interface CreateNotificationInput {
  kind: NotificationKind;
  title: string;
  body?: string;
  link?: string;
  /** When set, this notification is delivered only to that user id. */
  recipientUserId?: string;
}

export interface NotificationRepository {
  create(input: CreateNotificationInput): Promise<AdminNotification>;
  /** Admin broadcast list (where recipientUserId is undefined). */
  list(limit?: number): Promise<AdminNotification[]>;
  /** Per-user list — only notifications targeted at this user. */
  listForUser(userId: string, limit?: number): Promise<AdminNotification[]>;
  /** Unread count for admins among broadcast notifications. */
  countUnread(userId: string): Promise<number>;
  /** Unread count for a specific user's own notifications. */
  countUnreadForUser(userId: string): Promise<number>;
  markRead(id: string, userId: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
  markAllReadForUser(userId: string): Promise<void>;
}

let repoPromise: Promise<NotificationRepository> | null = null;

export async function getNotificationRepository(): Promise<NotificationRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      if (process.env.MONGO_DB_URL) {
        const { MongoNotificationRepository } = await import(
          "./repositories/mongo-notification-repository"
        );
        return new MongoNotificationRepository();
      }
      const { JsonNotificationRepository } = await import(
        "./repositories/json-notification-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[notifications] JsonNotificationRepository is DEV-ONLY. Set MONGO_DB_URL to use the Mongo-backed repository.",
        );
      }
      return new JsonNotificationRepository();
    })();
  }
  return repoPromise;
}
