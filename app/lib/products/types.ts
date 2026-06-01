export const SYSTEM_PRODUCT_CATEGORIES = [
  "wigs",
  "bundles",
  "frontals-and-closures",
  "accessories",
  "sale",
] as const;

export type SystemProductCategory = (typeof SYSTEM_PRODUCT_CATEGORIES)[number];

/**
 * Kept as a back-compat alias — many existing files import `PRODUCT_CATEGORIES`.
 * It holds the system-defined category slugs only; admins can add additional
 * slugs at runtime via the taxonomy page.
 */
export const PRODUCT_CATEGORIES = SYSTEM_PRODUCT_CATEGORIES;

/**
 * A product category slug. Historically a literal union; now a string so the
 * admin can introduce new categories without code changes. System category
 * slugs are still listed in {@link SYSTEM_PRODUCT_CATEGORIES} for the routes
 * that depend on them.
 */
export type ProductCategory = string;

export const SYSTEM_PRODUCT_CATEGORY_LABEL: Record<
  SystemProductCategory,
  string
> = {
  wigs: "Wigs",
  bundles: "Bundles",
  "frontals-and-closures": "Frontals & Closures",
  accessories: "Accessories",
  sale: "Sale",
};

/**
 * Back-compat: lookup of system category slugs to their human labels.
 * Use {@link resolveCategoryLabel} elsewhere so admin-added categories also
 * render with their custom labels.
 */
export const PRODUCT_CATEGORY_LABEL: Record<string, string> =
  SYSTEM_PRODUCT_CATEGORY_LABEL;

export function isSystemCategory(slug: string): slug is SystemProductCategory {
  return (SYSTEM_PRODUCT_CATEGORIES as readonly string[]).includes(slug);
}

export interface ProductRecord {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  type: string;
  priceCents: number;
  /** Primary image — always equal to `images[0]` when `images` is present. */
  imageUrl: string;
  /**
   * Full gallery for the product. The first entry is the primary image. New
   * uploads always populate this; legacy records may have only `imageUrl`.
   */
  images?: string[];
  stock: number;
  featured: boolean;
  badge?: { tone: "primary" | "secondary"; label: string };
  lengthOptions?: { length: string; priceCents: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface ListProductsFilters {
  category?: ProductCategory;
  featured?: boolean;
  q?: string;
  /**
   * When true, omit the heavy `images` gallery (base64 data URLs) from each
   * record. Grid/list views only render the primary `imageUrl`, so dropping
   * the gallery keeps the Mongo read and the RSC payload small. Detail pages
   * that need the full gallery must fetch the record via `findById`.
   */
  summary?: boolean;
}
