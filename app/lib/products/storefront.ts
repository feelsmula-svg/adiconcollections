import "server-only";

import { cache } from "react";

import type { CartProduct } from "@/app/lib/cart/types";
import {
  ACCESSORIES,
  FEATURED_PRODUCTS,
  allProducts as seedAllProducts,
} from "./catalog";
import { getProductRepository } from "./product-repository";
import type { ProductCategory, ProductRecord } from "./types";

/**
 * Request-scoped read of every admin-managed product. The storefront helpers
 * below all derive their results from this single list (filtering in memory),
 * so a page that needs several slices (featured, accessories, by-category)
 * pays a single Mongo query per request instead of one per section.
 *
 * NOTE: we use React `cache()` (per-request memoisation) rather than the
 * cross-request `unstable_cache` because admin products currently embed their
 * images as base64 data URLs, which pushes the serialised list well past the
 * 2 MB data-cache limit. Externalising images to files (see
 * `public/uploads/`) is the proper fix and would let this move back to a
 * tagged `unstable_cache`.
 */
const getCachedAdminProducts = cache(
  async (): Promise<ProductRecord[]> => {
    const repo = await getProductRepository();
    return repo.list();
  },
);

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
    images:
      record.images && record.images.length > 0
        ? record.images
        : record.imageUrl
          ? [record.imageUrl]
          : undefined,
    badge:
      record.badge ??
      (record.featured ? { tone: "primary", label: "Featured" } : undefined),
    lengthOptions: record.lengthOptions,
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
  const admin = await getCachedAdminProducts();
  return [...seedProducts(), ...admin.map(recordToCartProduct)];
}

export async function findStorefrontProduct(
  id: string,
): Promise<CartProduct | undefined> {
  const seed = seedProducts().find((p) => p.id === id);
  if (seed) return seed;
  const admin = await getCachedAdminProducts();
  const record = admin.find((p) => p.id === id);
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
  const all = await getCachedAdminProducts();
  const admin = all.filter((p) => p.category === category);
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
  const admin = await getCachedAdminProducts();
  const adminFeatured = admin.filter((p) => p.featured);
  return [...FEATURED_PRODUCTS, ...adminFeatured.map(recordToCartProduct)];
}

export async function getAccessoryStorefrontProducts(): Promise<CartProduct[]> {
  const admin = await getCachedAdminProducts();
  const accessories = admin.filter((p) => p.category === "accessories");
  return [...ACCESSORIES, ...accessories.map(recordToCartProduct)];
}
