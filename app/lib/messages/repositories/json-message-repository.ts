import "server-only";

// DEV ONLY — single-process JSON-backed message store.

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  AppendReplyInput,
  CreateContactMessageInput,
  ListContactMessagesFilters,
  MessageRepository,
} from "../message-repository";
import type { ContactMessage, ContactMessageStatus } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "contact-messages.json");

interface FileShape {
  messages: ContactMessage[];
}

export class JsonMessageRepository implements MessageRepository {
  private mutex: Promise<void> = Promise.resolve();

  async create(input: CreateContactMessageInput): Promise<ContactMessage> {
    return this.withLock(async () => {
      const data = await readFile();
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
      data.messages.push(record);
      await writeFile(data);
      return record;
    });
  }

  async list(
    filters: ListContactMessagesFilters = {},
  ): Promise<ContactMessage[]> {
    return this.withLock(async () => {
      const { messages } = await readFile();
      const filtered = filters.status
        ? messages.filter((m) => m.status === filters.status)
        : messages;
      return filtered
        .slice()
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    });
  }

  async findById(id: string): Promise<ContactMessage | null> {
    return this.withLock(async () => {
      const { messages } = await readFile();
      return messages.find((m) => m.id === id) ?? null;
    });
  }

  async appendReply(
    id: string,
    input: AppendReplyInput,
  ): Promise<ContactMessage | null> {
    return this.withLock(async () => {
      const data = await readFile();
      const index = data.messages.findIndex((m) => m.id === id);
      if (index === -1) return null;
      const current = data.messages[index];
      const reply = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        ...input.reply,
      };
      const updated: ContactMessage = {
        ...current,
        replies: [...current.replies, reply],
        status: "replied",
      };
      data.messages[index] = updated;
      await writeFile(data);
      return updated;
    });
  }

  async updateStatus(
    id: string,
    status: ContactMessageStatus,
  ): Promise<ContactMessage | null> {
    return this.withLock(async () => {
      const data = await readFile();
      const index = data.messages.findIndex((m) => m.id === id);
      if (index === -1) return null;
      const updated: ContactMessage = { ...data.messages[index], status };
      data.messages[index] = updated;
      await writeFile(data);
      return updated;
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
    if (!parsed || !Array.isArray(parsed.messages)) {
      return { messages: [] };
    }
    return {
      messages: parsed.messages.map((m) => ({
        ...m,
        replies: Array.isArray(m.replies) ? m.replies : [],
      })) as ContactMessage[],
    };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { messages: [] };
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
