import "server-only";

// DEV ONLY — single-process, not safe across serverless invocations or multiple workers.
// Replace with a real database adapter (Postgres, etc.) by implementing UserRepository
// and swapping the factory in app/lib/auth/user-repository.ts.

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  CreateUserInput,
  UserRepository,
} from "../user-repository";
import type { UserRecord } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "users.json");

interface FileShape {
  users: UserRecord[];
}

export class JsonUserRepository implements UserRepository {
  private mutex: Promise<void> = Promise.resolve();

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.withLock(async () => {
      const { users } = await readFile();
      const normalised = email.trim().toLowerCase();
      return users.find((u) => u.email === normalised) ?? null;
    });
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.withLock(async () => {
      const { users } = await readFile();
      return users.find((u) => u.id === id) ?? null;
    });
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    return this.withLock(async () => {
      const data = await readFile();
      const email = input.email.trim().toLowerCase();
      if (data.users.some((u) => u.email === email)) {
        throw new DuplicateEmailError(email);
      }
      const record: UserRecord = {
        id: randomUUID(),
        email,
        name: input.name.trim(),
        passwordHash: input.passwordHash,
        createdAt: new Date().toISOString(),
      };
      data.users.push(record);
      await writeFile(data);
      return record;
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

export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`A user with email "${email}" already exists`);
    this.name = "DuplicateEmailError";
  }
}

async function readFile(): Promise<FileShape> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<FileShape>;
    if (!parsed || !Array.isArray(parsed.users)) {
      return { users: [] };
    }
    return { users: parsed.users };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { users: [] };
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
