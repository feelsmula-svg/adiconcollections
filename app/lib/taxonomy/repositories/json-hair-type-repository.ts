import "server-only";

// DEV ONLY — single-process JSON file store. Replace with a real database adapter
// by implementing HairTypeRepository and swapping the factory.

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import {
  DuplicateHairTypeError,
  type CreateHairTypeInput,
  type HairTypeRepository,
  type UpdateHairTypeInput,
} from "../hair-type-repository";
import type { HairType } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "hair-types.json");

interface FileShape {
  types: HairType[];
}

function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class JsonHairTypeRepository implements HairTypeRepository {
  private mutex: Promise<void> = Promise.resolve();

  async list(): Promise<HairType[]> {
    return this.withLock(async () => {
      const { types } = await readFile();
      return [...types].sort((a, b) => a.label.localeCompare(b.label));
    });
  }

  async findById(id: string): Promise<HairType | null> {
    return this.withLock(async () => {
      const { types } = await readFile();
      return types.find((t) => t.id === id) ?? null;
    });
  }

  async findBySlug(slug: string): Promise<HairType | null> {
    const normalized = normalizeSlug(slug);
    return this.withLock(async () => {
      const { types } = await readFile();
      return types.find((t) => t.slug === normalized) ?? null;
    });
  }

  async create(input: CreateHairTypeInput): Promise<HairType> {
    return this.withLock(async () => {
      const data = await readFile();
      const slug = normalizeSlug(input.slug);
      if (data.types.some((t) => t.slug === slug)) {
        throw new DuplicateHairTypeError(slug);
      }
      const now = new Date().toISOString();
      const record: HairType = {
        id: randomUUID(),
        slug,
        label: input.label.trim(),
        description: input.description?.trim() ?? "",
        category: input.category,
        createdAt: now,
        updatedAt: now,
      };
      data.types.push(record);
      await writeFile(data);
      return record;
    });
  }

  async update(
    id: string,
    input: UpdateHairTypeInput,
  ): Promise<HairType | null> {
    return this.withLock(async () => {
      const data = await readFile();
      const index = data.types.findIndex((t) => t.id === id);
      if (index === -1) return null;
      const existing = data.types[index];
      const nextSlug = input.slug
        ? normalizeSlug(input.slug)
        : existing.slug;
      if (
        nextSlug !== existing.slug &&
        data.types.some((t) => t.slug === nextSlug && t.id !== id)
      ) {
        throw new DuplicateHairTypeError(nextSlug);
      }
      const updated: HairType = {
        ...existing,
        slug: nextSlug,
        label: input.label?.trim() ?? existing.label,
        description: input.description?.trim() ?? existing.description,
        category: input.category ?? existing.category,
        updatedAt: new Date().toISOString(),
      };
      data.types[index] = updated;
      await writeFile(data);
      return updated;
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.withLock(async () => {
      const data = await readFile();
      const next = data.types.filter((t) => t.id !== id);
      if (next.length === data.types.length) return false;
      await writeFile({ types: next });
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
    if (!parsed || !Array.isArray(parsed.types)) {
      return { types: [] };
    }
    return { types: parsed.types };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { types: [] };
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
