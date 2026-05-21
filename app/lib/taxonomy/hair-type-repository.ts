import "server-only";

import type { ProductCategory } from "@/app/lib/products/types";
import type { HairType } from "./types";

export interface CreateHairTypeInput {
  slug: string;
  label: string;
  description?: string;
  category: ProductCategory;
}

export interface UpdateHairTypeInput {
  slug?: string;
  label?: string;
  description?: string;
  category?: ProductCategory;
}

export interface HairTypeRepository {
  list(): Promise<HairType[]>;
  findById(id: string): Promise<HairType | null>;
  findBySlug(slug: string): Promise<HairType | null>;
  create(input: CreateHairTypeInput): Promise<HairType>;
  update(id: string, input: UpdateHairTypeInput): Promise<HairType | null>;
  delete(id: string): Promise<boolean>;
}

export class DuplicateHairTypeError extends Error {
  constructor(slug: string) {
    super(`Hair type with slug "${slug}" already exists`);
    this.name = "DuplicateHairTypeError";
  }
}

let repoPromise: Promise<HairTypeRepository> | null = null;

export async function getHairTypeRepository(): Promise<HairTypeRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      const { JsonHairTypeRepository } = await import(
        "./repositories/json-hair-type-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[taxonomy] JsonHairTypeRepository is DEV-ONLY. It is not safe across serverless invocations or multiple workers.",
        );
      }
      return new JsonHairTypeRepository();
    })();
  }
  return repoPromise;
}
