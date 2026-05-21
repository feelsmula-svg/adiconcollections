import "server-only";

// DEV ONLY — single-process JSON-backed reset token store.

import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  CreateResetTokenInput,
  ResetTokenRepository,
} from "../reset-token-repository";
import type { PasswordResetRecord } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "password-resets.json");

interface FileShape {
  tokens: PasswordResetRecord[];
}

export class JsonResetTokenRepository implements ResetTokenRepository {
  private mutex: Promise<void> = Promise.resolve();

  async create(input: CreateResetTokenInput): Promise<PasswordResetRecord> {
    return this.withLock(async () => {
      const data = await readFile();
      const now = new Date().toISOString();
      // Best-effort cleanup: drop tokens that are already expired or older than 7 days.
      const keepAfter = Date.now() - 7 * 24 * 60 * 60 * 1000;
      data.tokens = data.tokens.filter((entry) => {
        const isExpired = new Date(entry.expiresAt).getTime() < Date.now();
        const isOld = new Date(entry.createdAt).getTime() < keepAfter;
        return !isExpired && !isOld;
      });

      const record: PasswordResetRecord = {
        tokenHash: input.tokenHash,
        userId: input.userId,
        email: input.email,
        createdAt: now,
        expiresAt: input.expiresAt,
      };
      data.tokens.push(record);
      await writeFile(data);
      return record;
    });
  }

  async findActiveByHash(
    tokenHash: string,
  ): Promise<PasswordResetRecord | null> {
    return this.withLock(async () => {
      const { tokens } = await readFile();
      const entry = tokens.find((t) => t.tokenHash === tokenHash) ?? null;
      if (!entry) return null;
      if (entry.consumedAt) return null;
      if (new Date(entry.expiresAt).getTime() <= Date.now()) return null;
      return entry;
    });
  }

  async consume(tokenHash: string): Promise<void> {
    return this.withLock(async () => {
      const data = await readFile();
      const now = new Date().toISOString();
      data.tokens = data.tokens.map((entry) =>
        entry.tokenHash === tokenHash && !entry.consumedAt
          ? { ...entry, consumedAt: now }
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
    if (!parsed || !Array.isArray(parsed.tokens)) {
      return { tokens: [] };
    }
    return { tokens: parsed.tokens };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { tokens: [] };
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
