import { z } from "zod";

export const updateStoreProfileSchema = z.object({
  brandName: z
    .string()
    .trim()
    .min(1, "Brand name is required")
    .max(80, "Brand name is too long"),
  supportEmail: z
    .string()
    .trim()
    .min(1, "Support email is required")
    .email("Enter a valid email address"),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, "Use a 3-letter ISO currency code (e.g. USD)")
    .regex(/^[A-Z]{3}$/, "Use a 3-letter ISO currency code (e.g. USD)"),
});

export type UpdateStoreProfileInput = z.infer<typeof updateStoreProfileSchema>;
