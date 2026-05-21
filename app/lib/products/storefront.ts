import "server-only";

import type { CartProduct } from "@/app/lib/cart/types";
import {
  ACCESSORIES,
  FEATURED_PRODUCTS,
  allProducts as seedAllProducts,
} from "./catalog";
import { getProductRepository } from "./product-repository";
import type { ProductCategory, ProductRecord } from "./types";

/**
 * Bridge a server-managed ProductRecord into the storefront CartProduct shape
 * used by existing UI components (ProductCard, CollectionContent, etc.).
 */
export function recordToCartProduct(record: ProductRecord): CartProduct {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    priceCents: record.priceCents,
    imageSrc: record.imageUrl,
    imageAlt: record.name,
    badge: record.featured
      ? { tone: "primary", label: "Featured" }
      : undefined,
  };
}

const SEED_PRODUCT_IDS = new Set(seedAllProducts().map((p) => p.id));

export function isSeedProduct(id: string): boolean {
  return SEED_PRODUCT_IDS.has(id);
}

/** Seed products that ship with the app (read-only from admin's perspective). */
export function seedProducts(): CartProduct[] {
  return seedAllProducts();
}

/** All products visible on the storefront — seed + admin-uploaded. */
export async function getAllStorefrontProducts(): Promise<CartProduct[]> {
  const repo = await getProductRepository();
  const admin = await repo.list();
  return [...seedProducts(), ...admin.map(recordToCartProduct)];
}

export async function findStorefrontProduct(
  id: string,
): Promise<CartProduct | undefined> {
  const seed = seedProducts().find((p) => p.id === id);
  if (seed) return seed;
  const repo = await getProductRepository();
  const record = await repo.findById(id);
  return record ? recordToCartProduct(record) : undefined;
}

export async function getStorefrontProductsByKeywords(
  keywords: string[],
): Promise<CartProduct[]> {
  const all = await getAllStorefrontProducts();
  const needles = keywords.map((k) => k.toLowerCase());
  return all.filter((p) => {
    const hay = `${p.name} ${p.description ?? ""}`.toLowerCase();
    return needles.some((n) => hay.includes(n));
  });
}

export async function getStorefrontProductsByCategory(
  category: ProductCategory,
  fallbackKeywords: string[] = [],
): Promise<CartProduct[]> {
  const repo = await getProductRepository();
  const admin = await repo.list({ category });
  const seed =
    fallbackKeywords.length > 0
      ? seedProducts().filter((p) => {
          const hay = `${p.name} ${p.description ?? ""}`.toLowerCase();
          return fallbackKeywords.some((k) => hay.includes(k.toLowerCase()));
        })
      : [];
  return [...seed, ...admin.map(recordToCartProduct)];
}

export async function getFeaturedStorefrontProducts(): Promise<CartProduct[]> {
  const repo = await getProductRepository();
  const adminFeatured = await repo.list({ featured: true });
  return [...FEATURED_PRODUCTS, ...adminFeatured.map(recordToCartProduct)];
}

export async function getAccessoryStorefrontProducts(): Promise<CartProduct[]> {
  const repo = await getProductRepository();
  const admin = await repo.list({ category: "accessories" });
  return [...ACCESSORIES, ...admin.map(recordToCartProduct)];
}
