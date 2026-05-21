import "server-only";

// DEV ONLY — single-process JSON file store. Replace with a real database adapter
// by implementing ProductRepository and swapping the factory.

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  CreateProductInput,
  ProductRepository,
  UpdateProductInput,
} from "../product-repository";
import type { ListProductsFilters, ProductRecord } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "products.json");

interface FileShape {
  products: ProductRecord[];
}

export class JsonProductRepository implements ProductRepository {
  private mutex: Promise<void> = Promise.resolve();

  async list(filters: ListProductsFilters = {}): Promise<ProductRecord[]> {
    return this.withLock(async () => {
      const { products } = await readFile();
      const q = filters.q?.trim().toLowerCase();
      return products
        .filter((product) => {
          if (filters.category && product.category !== filters.category)
            return false;
          if (
            typeof filters.featured === "boolean" &&
            product.featured !== filters.featured
          )
            return false;
          if (q) {
            const haystack =
              `${product.name} ${product.type} ${product.description}`.toLowerCase();
            if (!haystack.includes(q)) return false;
          }
          return true;
        })
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    });
  }

  async findById(id: string): Promise<ProductRecord | null> {
    return this.withLock(async () => {
      const { products } = await readFile();
      return products.find((p) => p.id === id) ?? null;
    });
  }

  async create(input: CreateProductInput): Promise<ProductRecord> {
    return this.withLock(async () => {
      const data = await readFile();
      const now = new Date().toISOString();
      const record: ProductRecord = {
        id: randomUUID(),
        name: input.name.trim(),
        description: input.description.trim(),
        category: input.category,
        type: input.type.trim(),
        priceCents: input.priceCents,
        imageUrl: input.imageUrl.trim(),
        stock: input.stock,
        featured: input.featured ?? false,
        createdAt: now,
        updatedAt: now,
      };
      data.products.push(record);
      await writeFile(data);
      return record;
    });
  }

  async update(
    id: string,
    input: UpdateProductInput,
  ): Promise<ProductRecord | null> {
    return this.withLock(async () => {
      const data = await readFile();
      const index = data.products.findIndex((p) => p.id === id);
      if (index === -1) return null;
      const existing = data.products[index];
      const updated: ProductRecord = {
        ...existing,
        name: input.name?.trim() ?? existing.name,
        description: input.description?.trim() ?? existing.description,
        category: input.category ?? existing.category,
        type: input.type?.trim() ?? existing.type,
        priceCents: input.priceCents ?? existing.priceCents,
        imageUrl: input.imageUrl?.trim() ?? existing.imageUrl,
        stock: input.stock ?? existing.stock,
        featured: input.featured ?? existing.featured,
        updatedAt: new Date().toISOString(),
      };
      data.products[index] = updated;
      await writeFile(data);
      return updated;
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.withLock(async () => {
      const data = await readFile();
      const next = data.products.filter((p) => p.id !== id);
      if (next.length === data.products.length) return false;
      await writeFile({ products: next });
      return true;
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
    if (!parsed || !Array.isArray(parsed.products)) {
      return { products: [] };
    }
    return { products: parsed.products };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { products: [] };
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
