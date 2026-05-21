import "server-only";

// DEV ONLY — single-process JSON file store. Replace with a real database adapter
// by implementing CategoryRepository and swapping the factory.

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import {
  SYSTEM_PRODUCT_CATEGORIES,
  SYSTEM_PRODUCT_CATEGORY_LABEL,
} from "@/app/lib/products/types";

import {
  DuplicateCategoryError,
  ProtectedCategoryError,
  type CategoryRepository,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "../category-repository";
import type { CategoryRecord } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "categories.json");

interface FileShape {
  categories: CategoryRecord[];
}

function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSystemSeed(): CategoryRecord[] {
  const now = new Date().toISOString();
  return SYSTEM_PRODUCT_CATEGORIES.map((slug) => ({
    id: `system:${slug}`,
    slug,
    label: SYSTEM_PRODUCT_CATEGORY_LABEL[slug],
    description: "",
    isSystem: true,
    createdAt: now,
    updatedAt: now,
  }));
}

/**
 * Make sure every system category exists in the file. Returns the merged set,
 * preserving any descriptions/labels admins have customized on system entries.
 */
function ensureSystemSeeds(existing: CategoryRecord[]): {
  records: CategoryRecord[];
  changed: boolean;
} {
  const seedBySlug = new Map(buildSystemSeed().map((r) => [r.slug, r]));
  const seenSystemSlugs = new Set<string>();
  let changed = false;

  const normalized = existing.map((record) => {
    const systemSeed = seedBySlug.get(record.slug);
    if (!systemSeed) return record;
    seenSystemSlugs.add(record.slug);
    if (!record.isSystem) {
      changed = true;
      return { ...record, isSystem: true };
    }
    return record;
  });

  for (const seed of seedBySlug.values()) {
    if (seenSystemSlugs.has(seed.slug)) continue;
    normalized.push(seed);
    changed = true;
  }

  return { records: normalized, changed };
}

export class JsonCategoryRepository implements CategoryRepository {
  private mutex: Promise<void> = Promise.resolve();

  async list(): Promise<CategoryRecord[]> {
    return this.withLock(async () => {
      const data = await readAndSeed();
      return [...data.categories].sort((a, b) => {
        if (a.isSystem !== b.isSystem) return a.isSystem ? -1 : 1;
        return a.label.localeCompare(b.label);
      });
    });
  }

  async findById(id: string): Promise<CategoryRecord | null> {
    return this.withLock(async () => {
      const data = await readAndSeed();
      return data.categories.find((c) => c.id === id) ?? null;
    });
  }

  async findBySlug(slug: string): Promise<CategoryRecord | null> {
    const normalized = normalizeSlug(slug);
    return this.withLock(async () => {
      const data = await readAndSeed();
      return data.categories.find((c) => c.slug === normalized) ?? null;
    });
  }

  async create(input: CreateCategoryInput): Promise<CategoryRecord> {
    return this.withLock(async () => {
      const data = await readAndSeed();
      const slug = normalizeSlug(input.slug);
      if (slug.length === 0) {
        throw new DuplicateCategoryError(slug);
      }
      if (data.categories.some((c) => c.slug === slug)) {
        throw new DuplicateCategoryError(slug);
      }
      const now = new Date().toISOString();
      const record: CategoryRecord = {
        id: randomUUID(),
        slug,
        label: input.label.trim(),
        description: input.description?.trim() ?? "",
        isSystem: false,
        createdAt: now,
        updatedAt: now,
      };
      data.categories.push(record);
      await writeFile(data);
      return record;
    });
  }

  async update(
    id: string,
    input: UpdateCategoryInput,
  ): Promise<CategoryRecord | null> {
    return this.withLock(async () => {
      const data = await readAndSeed();
      const index = data.categories.findIndex((c) => c.id === id);
      if (index === -1) return null;
      const existing = data.categories[index];
      const updated: CategoryRecord = {
        ...existing,
        label: input.label?.trim() ?? existing.label,
        description: input.description?.trim() ?? existing.description,
        updatedAt: new Date().toISOString(),
      };
      data.categories[index] = updated;
      await writeFile(data);
      return updated;
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.withLock(async () => {
      const data = await readAndSeed();
      const target = data.categories.find((c) => c.id === id);
      if (!target) return false;
      if (target.isSystem) {
        throw new ProtectedCategoryError(target.slug);
      }
      const next = data.categories.filter((c) => c.id !== id);
      await writeFile({ categories: next });
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

async function readAndSeed(): Promise<FileShape> {
  const data = await readFile();
  const { records, changed } = ensureSystemSeeds(data.categories);
  if (changed) {
    await writeFile({ categories: records });
  }
  return { categories: records };
}

async function readFile(): Promise<FileShape> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<FileShape>;
    if (!parsed || !Array.isArray(parsed.categories)) {
      return { categories: [] };
    }
    return { categories: parsed.categories };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { categories: [] };
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
