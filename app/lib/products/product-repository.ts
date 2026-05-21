import "server-only";

import type {
  ListProductsFilters,
  ProductCategory,
  ProductRecord,
} from "./types";

export interface CreateProductInput {
  name: string;
  description: string;
  category: ProductCategory;
  type: string;
  priceCents: number;
  imageUrl: string;
  stock: number;
  featured?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  category?: ProductCategory;
  type?: string;
  priceCents?: number;
  imageUrl?: string;
  stock?: number;
  featured?: boolean;
}

export interface ProductRepository {
  list(filters?: ListProductsFilters): Promise<ProductRecord[]>;
  findById(id: string): Promise<ProductRecord | null>;
  create(input: CreateProductInput): Promise<ProductRecord>;
  update(id: string, input: UpdateProductInput): Promise<ProductRecord | null>;
  delete(id: string): Promise<boolean>;
}

let repoPromise: Promise<ProductRepository> | null = null;

export async function getProductRepository(): Promise<ProductRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      const { JsonProductRepository } = await import(
        "./repositories/json-product-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[products] JsonProductRepository is DEV-ONLY. It is not safe across serverless invocations or multiple workers.",
        );
      }
      return new JsonProductRepository();
    })();
  }
  return repoPromise;
}
