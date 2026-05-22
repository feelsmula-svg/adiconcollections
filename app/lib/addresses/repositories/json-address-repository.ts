import "server-only";

// DEV ONLY — single-process, not safe across serverless invocations or multiple workers.

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type { AddressRepository } from "../address-repository";
import type { AddressInput, AddressRecord } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "addresses.json");

interface FileShape {
  addresses: AddressRecord[];
}

function normalise(
  userId: string,
  id: string,
  input: AddressInput,
  createdAt: string,
): AddressRecord {
  const line2 = input.line2?.trim();
  const phone = input.phone?.trim();
  return {
    id,
    userId,
    name: input.name.trim(),
    line1: input.line1.trim(),
    line2: line2 && line2.length > 0 ? line2 : undefined,
    city: input.city.trim(),
    state: input.state.trim(),
    postal: input.postal.trim(),
    country: input.country.trim(),
    phone: phone && phone.length > 0 ? phone : undefined,
    isDefaultShipping: input.isDefaultShipping ?? false,
    isDefaultBilling: input.isDefaultBilling ?? false,
    createdAt,
  };
}

export class JsonAddressRepository implements AddressRepository {
  private mutex: Promise<void> = Promise.resolve();

  async listForUser(userId: string): Promise<AddressRecord[]> {
    return this.withLock(async () => {
      const data = await readFile();
      return data.addresses
        .filter((addr) => addr.userId === userId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    });
  }

  async findById(id: string, userId: string): Promise<AddressRecord | null> {
    return this.withLock(async () => {
      const data = await readFile();
      return (
        data.addresses.find(
          (addr) => addr.id === id && addr.userId === userId,
        ) ?? null
      );
    });
  }

  async create(userId: string, input: AddressInput): Promise<AddressRecord> {
    return this.withLock(async () => {
      const data = await readFile();
      const record = normalise(
        userId,
        randomUUID(),
        input,
        new Date().toISOString(),
      );
      const next = clearDefaultsIfNeeded(data.addresses, userId, record);
      next.push(record);
      data.addresses = next;
      await writeFile(data);
      return record;
    });
  }

  async update(
    id: string,
    userId: string,
    input: AddressInput,
  ): Promise<AddressRecord | null> {
    return this.withLock(async () => {
      const data = await readFile();
      const existing = data.addresses.find(
        (addr) => addr.id === id && addr.userId === userId,
      );
      if (!existing) return null;
      const record = normalise(userId, id, input, existing.createdAt);
      let next = data.addresses.filter(
        (addr) => !(addr.id === id && addr.userId === userId),
      );
      next = clearDefaultsIfNeeded(next, userId, record);
      next.push(record);
      data.addresses = next;
      await writeFile(data);
      return record;
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    return this.withLock(async () => {
      const data = await readFile();
      const before = data.addresses.length;
      data.addresses = data.addresses.filter(
        (addr) => !(addr.id === id && addr.userId === userId),
      );
      const changed = data.addresses.length !== before;
      if (changed) await writeFile(data);
      return changed;
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

function clearDefaultsIfNeeded(
  list: AddressRecord[],
  userId: string,
  record: AddressRecord,
): AddressRecord[] {
  return list.map((addr) => {
    if (addr.userId !== userId || addr.id === record.id) return addr;
    let next = addr;
    if (record.isDefaultShipping && addr.isDefaultShipping) {
      next = { ...next, isDefaultShipping: false };
    }
    if (record.isDefaultBilling && addr.isDefaultBilling) {
      next = { ...next, isDefaultBilling: false };
    }
    return next;
  });
}

async function readFile(): Promise<FileShape> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<FileShape>;
    if (!parsed || !Array.isArray(parsed.addresses)) {
      return { addresses: [] };
    }
    return { addresses: parsed.addresses as AddressRecord[] };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { addresses: [] };
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
