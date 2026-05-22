import "server-only";

// DEV ONLY — single-process JSON-backed notification store.

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  CreateNotificationInput,
  NotificationRepository,
} from "../notification-repository";
import type { AdminNotification } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "admin-notifications.json");

interface FileShape {
  notifications: AdminNotification[];
}

export class JsonNotificationRepository implements NotificationRepository {
  private mutex: Promise<void> = Promise.resolve();

  async create(input: CreateNotificationInput): Promise<AdminNotification> {
    return this.withLock(async () => {
      const data = await readFile();
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
      data.notifications.push(record);
      // Trim history to the latest 500 to keep the file small.
      data.notifications = data.notifications
        .slice()
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 500);
      await writeFile(data);
      return record;
    });
  }

  async list(limit = 30): Promise<AdminNotification[]> {
    return this.withLock(async () => {
      const data = await readFile();
      return data.notifications
        .filter((n) => !n.recipientUserId)
        .slice()
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, Math.min(Math.max(limit, 1), 200));
    });
  }

  async listForUser(
    userId: string,
    limit = 30,
  ): Promise<AdminNotification[]> {
    return this.withLock(async () => {
      const data = await readFile();
      return data.notifications
        .filter((n) => n.recipientUserId === userId)
        .slice()
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, Math.min(Math.max(limit, 1), 200));
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.withLock(async () => {
      const { notifications } = await readFile();
      return notifications.filter(
        (n) => !n.recipientUserId && !n.readBy.includes(userId),
      ).length;
    });
  }

  async countUnreadForUser(userId: string): Promise<number> {
    return this.withLock(async () => {
      const { notifications } = await readFile();
      return notifications.filter(
        (n) => n.recipientUserId === userId && !n.readBy.includes(userId),
      ).length;
    });
  }

  async markRead(id: string, userId: string): Promise<void> {
    return this.withLock(async () => {
      const data = await readFile();
      data.notifications = data.notifications.map((entry) => {
        if (entry.id !== id) return entry;
        if (entry.readBy.includes(userId)) return entry;
        return { ...entry, readBy: [...entry.readBy, userId] };
      });
      await writeFile(data);
    });
  }

  async markAllRead(userId: string): Promise<void> {
    return this.withLock(async () => {
      const data = await readFile();
      data.notifications = data.notifications.map((entry) =>
        !entry.recipientUserId && !entry.readBy.includes(userId)
          ? { ...entry, readBy: [...entry.readBy, userId] }
          : entry,
      );
      await writeFile(data);
    });
  }

  async markAllReadForUser(userId: string): Promise<void> {
    return this.withLock(async () => {
      const data = await readFile();
      data.notifications = data.notifications.map((entry) =>
        entry.recipientUserId === userId && !entry.readBy.includes(userId)
          ? { ...entry, readBy: [...entry.readBy, userId] }
          : entry,
      );
      await writeFile(data);
    });
  }

  private withLock<T>(work: () => Promise<T>): Promise<T> {
    const previous = this.mutex;
    let release: () => void = () => {};
    this.mutex = new Promise<void>((resolve) => {
      release = resolve;
    });
    return previous.then(async () => {
      try {
        return await work();
      } finally {
        release();
      }
    });
  }
}

async function readFile(): Promise<FileShape> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<FileShape>;
    if (!parsed || !Array.isArray(parsed.notifications)) {
      return { notifications: [] };
    }
    return {
      notifications: parsed.notifications.map((entry) => ({
        ...entry,
        readBy: Array.isArray(entry.readBy) ? entry.readBy : [],
      })) as AdminNotification[],
    };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { notifications: [] };
    }
    throw error;
  }
}

async function writeFile(data: FileShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, FILE_PATH);
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && "code" in value;
}
