import "server-only";

// DEV ONLY — single-process, not safe across serverless invocations or multiple workers.

import { promises as fs } from "node:fs";
import path from "node:path";

import type { WishlistRepository } from "../wishlist-repository";
import type { WishlistRecord } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "wishlists.json");

interface FileShape {
  wishlists: WishlistRecord[];
}

function nowIso(): string {
  return new Date().toISOString();
}

export class JsonWishlistRepository implements WishlistRepository {
  private mutex: Promise<void> = Promise.resolve();

  async listIds(userId: string): Promise<string[]> {
    return this.withLock(async () => {
      const data = await readFile();
      return (
        data.wishlists.find((entry) => entry.userId === userId)?.productIds ??
        []
      );
    });
  }

  async toggle(userId: string, productId: string): Promise<string[]> {
    return this.withLock(async () => {
      const data = await readFile();
      const idx = data.wishlists.findIndex((entry) => entry.userId === userId);
      if (idx === -1) {
        data.wishlists.push({
          userId,
          productIds: [productId],
          updatedAt: nowIso(),
        });
      } else {
        const current = data.wishlists[idx];
        const has = current.productIds.includes(productId);
        const productIds = has
          ? current.productIds.filter((id) => id !== productId)
          : [...current.productIds, productId];
        data.wishlists[idx] = {
          ...current,
          productIds,
          updatedAt: nowIso(),
        };
      }
      await writeFile(data);
      return (
        data.wishlists.find((entry) => entry.userId === userId)?.productIds ??
        []
      );
    });
  }

  async add(userId: string, productId: string): Promise<string[]> {
    return this.withLock(async () => {
      const data = await readFile();
      const idx = data.wishlists.findIndex((entry) => entry.userId === userId);
      if (idx === -1) {
        data.wishlists.push({
          userId,
          productIds: [productId],
          updatedAt: nowIso(),
        });
      } else {
        const current = data.wishlists[idx];
        if (!current.productIds.includes(productId)) {
          data.wishlists[idx] = {
            ...current,
            productIds: [...current.productIds, productId],
            updatedAt: nowIso(),
          };
        }
      }
      await writeFile(data);
      return (
        data.wishlists.find((entry) => entry.userId === userId)?.productIds ??
        []
      );
    });
  }

  async remove(userId: string, productId: string): Promise<string[]> {
    return this.withLock(async () => {
      const data = await readFile();
      const idx = data.wishlists.findIndex((entry) => entry.userId === userId);
      if (idx !== -1) {
        const current = data.wishlists[idx];
        data.wishlists[idx] = {
          ...current,
          productIds: current.productIds.filter((id) => id !== productId),
          updatedAt: nowIso(),
        };
        await writeFile(data);
      }
      return (
        data.wishlists.find((entry) => entry.userId === userId)?.productIds ??
        []
      );
    });
  }

  async clear(userId: string): Promise<void> {
    return this.withLock(async () => {
      const data = await readFile();
      const idx = data.wishlists.findIndex((entry) => entry.userId === userId);
      if (idx === -1) {
        data.wishlists.push({ userId, productIds: [], updatedAt: nowIso() });
      } else {
        data.wishlists[idx] = {
          ...data.wishlists[idx],
          productIds: [],
          updatedAt: nowIso(),
        };
      }
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
    if (!parsed || !Array.isArray(parsed.wishlists)) {
      return { wishlists: [] };
    }
    return { wishlists: parsed.wishlists as WishlistRecord[] };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { wishlists: [] };
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
