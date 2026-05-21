import type { CartProduct } from "@/app/lib/cart/types";

import { ACCESSORIES, FEATURED_PRODUCTS } from "./catalog";
import type { ProductCategory } from "./types";

export const DEFAULT_SEED_STOCK = 25;

export interface SeedProductMeta {
  product: CartProduct;
  category: ProductCategory;
  type: string;
  featured: boolean;
}

function asMeta(
  product: CartProduct,
  category: ProductCategory,
  featured: boolean,
): SeedProductMeta {
  return {
    product,
    category,
    type: product.description ?? "Hair",
    featured,
  };
}

export function seedProductMetas(): SeedProductMeta[] {
  return [
    ...FEATURED_PRODUCTS.map((p) => asMeta(p, "wigs", true)),
    ...ACCESSORIES.map((p) => asMeta(p, "accessories", false)),
  ];
}

const META_BY_ID = new Map(
  seedProductMetas().map((meta) => [meta.product.id, meta]),
);

export function getSeedProductMeta(id: string): SeedProductMeta | undefined {
  return META_BY_ID.get(id);
}

export function seedProductIds(): string[] {
  return Array.from(META_BY_ID.keys());
}
