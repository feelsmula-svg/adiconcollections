import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Too long"),
  description: z.string().trim().min(1, "Description is required").max(800, "Too long"),
  category: z.string().trim().min(1, "Category is required").max(60, "Too long"),
  type: z.string().trim().min(1, "Type is required").max(60, "Too long"),
  priceCents: z
    .number({ invalid_type_error: "Price must be a number" })
    .int("Price must be a whole number of cents")
    .min(0, "Price must be ≥ 0")
    .max(1_000_000_00, "Too large"),
  imageUrl: z
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
    ),
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
