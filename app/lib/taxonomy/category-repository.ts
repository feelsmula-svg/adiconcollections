import "server-only";

import type { CategoryRecord } from "./types";

export interface CreateCategoryInput {
  slug: string;
  label: string;
  description?: string;
}

export interface UpdateCategoryInput {
  label?: string;
  description?: string;
}

export interface CategoryRepository {
  list(): Promise<CategoryRecord[]>;
  findById(id: string): Promise<CategoryRecord | null>;
  findBySlug(slug: string): Promise<CategoryRecord | null>;
  create(input: CreateCategoryInput): Promise<CategoryRecord>;
  update(id: string, input: UpdateCategoryInput): Promise<CategoryRecord | null>;
  delete(id: string): Promise<boolean>;
}

export class DuplicateCategoryError extends Error {
  constructor(slug: string) {
    super(`Category with slug "${slug}" already exists`);
    this.name = "DuplicateCategoryError";
  }
}

export class ProtectedCategoryError extends Error {
  constructor(slug: string) {
    super(`Category "${slug}" is a system category and cannot be removed`);
    this.name = "ProtectedCategoryError";
  }
}

let repoPromise: Promise<CategoryRepository> | null = null;

export async function getCategoryRepository(): Promise<CategoryRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      if (process.env.MONGO_DB_URL) {
        const { MongoCategoryRepository } = await import(
          "./repositories/mongo-category-repository"
        );
        return new MongoCategoryRepository();
      }
      const { JsonCategoryRepository } = await import(
        "./repositories/json-category-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[taxonomy] JsonCategoryRepository is DEV-ONLY. Set MONGO_DB_URL to use the Mongo-backed repository.",
        );
      }
      return new JsonCategoryRepository();
    })();
  }
  return repoPromise;
}
