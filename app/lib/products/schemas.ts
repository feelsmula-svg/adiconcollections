import { z } from "zod";

const imageStringSchema = z
  .string()
  .trim()
  .min(1, "Image is required")
  // Blob URLs are short (~100 chars). Base64 strings (legacy data) are kept
  // working until the migration script converts all existing products.
  .max(8_000_000, "Image is too large")
  .refine(
    (value) =>
      /^data:image\/(jpeg|png|webp|gif);base64,/i.test(value) ||
      value.startsWith("/") ||
      /^https?:\/\//i.test(value),
    "Image must be a Vercel Blob URL, a /public path, or an http(s) URL",
  );

const lengthOptionSchema = z.object({
  length: z
    .string()
    .trim()
    .min(1, "Length label is required")
    .max(40, "Length label is too long"),
  priceCents: z
    .number({ invalid_type_error: "Length price must be a number" })
    .int("Length price must be a whole number of cents")
    .min(0, "Length price must be ≥ 0")
    .max(1_000_000_00, "Length price too large"),
});

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Too long"),
  description: z.string().trim().min(1, "Description is required").max(800, "Too long"),
  category: z.string().trim().min(1, "Category is required").max(60, "Too long"),
  /**
   * Hair type slug. Optional — products in categories without any types
   * defined in the taxonomy (e.g. accessories) save with an empty string.
   */
  type: z.string().trim().max(60, "Too long").default(""),
  priceCents: z
    .number({ invalid_type_error: "Price must be a number" })
    .int("Price must be a whole number of cents")
    .min(0, "Price must be ≥ 0")
    .max(1_000_000_00, "Too large"),
  /**
   * Whole-percent discount applied to the base price and every length variant.
   * `0` (or omitted) means no discount. Capped at 95% so a product can never
   * effectively become free.
   */
  discountPercent: z
    .number({ invalid_type_error: "Discount must be a number" })
    .int("Discount must be a whole number")
    .min(0, "Discount must be ≥ 0")
    .max(95, "Discount must be ≤ 95")
    .optional(),
  /**
   * The full image gallery. Required for new uploads (≥ 1 image). The first
   * entry becomes the primary `imageUrl` stored on the record.
   */
  images: z
    .array(imageStringSchema)
    .min(1, "Upload at least one product image")
    .max(8, "At most 8 images per product"),
  /**
   * Optional list of length/price variants for products that come in
   * different lengths (wigs, bundles, etc.).
   */
  lengthOptions: z
    .array(lengthOptionSchema)
    .max(20, "Too many length options")
    .optional(),
  stock: z
    .number({ invalid_type_error: "Stock must be a number" })
    .int("Stock must be a whole number")
    .min(0, "Stock must be ≥ 0")
    .max(100_000, "Too large"),
  featured: z.boolean().optional(),
});

export const updateProductSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInputSchema = z.infer<typeof updateProductSchema>;
