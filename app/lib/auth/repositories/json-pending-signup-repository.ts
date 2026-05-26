import "server-only";

// DEV ONLY — single-process JSON-backed pending signup store.

import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  CreatePendingSignupInput,
  PendingSignupRepository,
} from "../pending-signup-repository";
import type { PendingSignupRecord } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "pending-signups.json");

interface FileShape {
  pending: PendingSignupRecord[];
}

export class JsonPendingSignupRepository implements PendingSignupRepository {
  private mutex: Promise<void> = Promise.resolve();

  async upsert(
    input: CreatePendingSignupInput,
  ): Promise<PendingSignupRecord> {
    return this.withLock(async () => {
      const data = await readFile();
      const email = input.email.trim().toLowerCase();
      const now = new Date().toISOString();
      const cleaned = data.pending.filter(
        (entry) =>
          entry.email !== email &&
          new Date(entry.expiresAt).getTime() > Date.now(),
      );
      const record: PendingSignupRecord = {
        email,
        name: input.name.trim(),
        passwordHash: input.passwordHash,
        otpHash: input.otpHash,
        attempts: 0,
        createdAt: now,
        expiresAt: input.expiresAt,
        resendAvailableAt: input.resendAvailableAt,
      };
      cleaned.push(record);
      data.pending = cleaned;
      await writeFile(data);
      return record;
    });
  }

  async findByEmail(email: string): Promise<PendingSignupRecord | null> {
    return this.withLock(async () => {
      const { pending } = await readFile();
      const normalised = email.trim().toLowerCase();
      const entry = pending.find((p) => p.email === normalised) ?? null;
      if (!entry) return null;
      if (new Date(entry.expiresAt).getTime() <= Date.now()) return null;
      return entry;
    });
  }

  async incrementAttempts(
    email: string,
  ): Promise<PendingSignupRecord | null> {
    return this.withLock(async () => {
      const data = await readFile();
      const normalised = email.trim().toLowerCase();
      const index = data.pending.findIndex((p) => p.email === normalised);
      if (index === -1) return null;
      const current = data.pending[index];
      const updated: PendingSignupRecord = {
        ...current,
        attempts: current.attempts + 1,
      };
      data.pending[index] = updated;
      await writeFile(data);
      return updated;
    });
  }

  async refreshOtp(
    email: string,
    otpHash: string,
    expiresAt: string,
    resendAvailableAt: string,
  ): Promise<PendingSignupRecord | null> {
    return this.withLock(async () => {
      const data = await readFile();
      const normalised = email.trim().toLowerCase();
      const index = data.pending.findIndex((p) => p.email === normalised);
      if (index === -1) return null;
      const current = data.pending[index];
      const updated: PendingSignupRecord = {
        ...current,
        otpHash,
        attempts: 0,
        expiresAt,
        resendAvailableAt,
      };
      data.pending[index] = updated;
      await writeFile(data);
      return updated;
    });
  }

  async delete(email: string): Promise<void> {
    return this.withLock(async () => {
      const data = await readFile();
      const normalised = email.trim().toLowerCase();
      data.pending = data.pending.filter((p) => p.email !== normalised);
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
    if (!parsed || !Array.isArray(parsed.pending)) {
      return { pending: [] };
    }
    return { pending: parsed.pending };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { pending: [] };
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
