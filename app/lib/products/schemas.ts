import { z } from "zod";

const imageStringSchema = z
  .string()
  .trim()
  .min(1, "Image is required")
  // ~6 MB worth of base64 — covers ~4.5 MB binary images with headroom.
  .max(8_000_000, "Image is too large")
  .refine(
    (value) =>
      /^data:image\/(jpeg|png|webp|gif);base64,/i.test(value) ||
      value.startsWith("/") ||
      /^https?:\/\//i.test(value),
    "Image must be an uploaded data URL, a /public path, or an http(s) URL",
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
