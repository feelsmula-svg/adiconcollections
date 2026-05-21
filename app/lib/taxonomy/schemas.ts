import { z } from "zod";

export const hairTypeSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(60, "Slug is too long")
    .regex(/^[a-zA-Z0-9-_ ]+$/, "Use letters, numbers, dashes and spaces only"),
  label: z.string().trim().min(1, "Label is required").max(80, "Too long"),
  description: z
    .string()
    .trim()
    .max(300, "Too long")
    .optional()
    .or(z.literal("")),
  category: z.string().trim().min(1, "Category is required"),
});

export const updateHairTypeSchema = hairTypeSchema.partial();

export type HairTypeInput = z.infer<typeof hairTypeSchema>;

export const categorySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(60, "Slug is too long")
    .regex(/^[a-zA-Z0-9-_ ]+$/, "Use letters, numbers, dashes and spaces only"),
  label: z.string().trim().min(1, "Label is required").max(80, "Too long"),
  description: z
    .string()
    .trim()
    .max(300, "Too long")
    .optional()
    .or(z.literal("")),
});

export const updateCategorySchema = categorySchema.partial();

export type CategoryInput = z.infer<typeof categorySchema>;
