import type { CartProduct } from "@/app/lib/cart/types";

export function allProducts(): CartProduct[] {
  return [...FEATURED_PRODUCTS, ...ACCESSORIES];
}

export function findProduct(id: string): CartProduct | undefined {
  return allProducts().find((p) => p.id === id);
}

export function allProductIds(): string[] {
  return allProducts().map((p) => p.id);
}

export function productsByKeywords(keywords: string[]): CartProduct[] {
  const needles = keywords.map((k) => k.toLowerCase());
  return allProducts().filter((p) => {
    const hay = `${p.name} ${p.description ?? ""}`.toLowerCase();
    return needles.some((n) => hay.includes(n));
  });
}

export function productsOnSale(maxCents: number): CartProduct[] {
  return allProducts().filter((p) => p.priceCents <= maxCents);
}

export const FEATURED_PRODUCTS: CartProduct[] = [];

export const ACCESSORIES: CartProduct[] = [];
