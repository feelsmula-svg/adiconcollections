import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import { DEFAULT_SEED_STOCK, getSeedProductMeta } from "./seed-stock";

export interface SeedStockRepository {
  getAll(): Promise<Record<string, number>>;
  get(id: string): Promise<number>;
  set(id: string, stock: number): Promise<number>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "seed-stock.json");

interface FileShape {
  stock: Record<string, number>;
}

export class JsonSeedStockRepository implements SeedStockRepository {
  private mutex: Promise<void> = Promise.resolve();

  async getAll(): Promise<Record<string, number>> {
    return this.withLock(async () => {
      const { stock } = await readFile();
      return { ...stock };
    });
  }

  async get(id: string): Promise<number> {
    return this.withLock(async () => {
      const { stock } = await readFile();
      if (typeof stock[id] === "number") return stock[id];
      return DEFAULT_SEED_STOCK;
    });
  }

  async set(id: string, stock: number): Promise<number> {
    if (!getSeedProductMeta(id)) {
      throw new SeedStockError(`Unknown seed product id: ${id}`);
    }
    if (!Number.isFinite(stock) || stock < 0) {
      throw new SeedStockError("Stock must be a non-negative number");
    }
    const value = Math.trunc(stock);
    return this.withLock(async () => {
      const data = await readFile();
      data.stock[id] = value;
      await writeFile(data);
      return value;
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

export class SeedStockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SeedStockError";
  }
}

async function readFile(): Promise<FileShape> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<FileShape>;
    if (!parsed || typeof parsed.stock !== "object" || parsed.stock === null) {
      return { stock: {} };
    }
    return { stock: { ...(parsed.stock as Record<string, number>) } };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { stock: {} };
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

let repoPromise: Promise<SeedStockRepository> | null = null;

export async function getSeedStockRepository(): Promise<SeedStockRepository> {
  if (!repoPromise) {
    repoPromise = Promise.resolve(new JsonSeedStockRepository());
  }
  return repoPromise;
}
