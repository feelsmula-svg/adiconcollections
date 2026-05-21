import type { ProductCategory } from "@/app/lib/products/types";

export interface HairType {
  id: string;
  slug: string;
  label: string;
  description: string;
  category: ProductCategory;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRecord {
  id: string;
  slug: string;
  label: string;
  description: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export function resolveCategoryLabel(
  slug: string,
  categories: ReadonlyArray<Pick<CategoryRecord, "slug" | "label">>,
): string {
  const match = categories.find((c) => c.slug === slug);
  return match ? match.label : slug;
}
