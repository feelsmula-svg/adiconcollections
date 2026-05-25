import { z } from "zod";

const methodSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Label is required")
    .max(80, "Label is too long"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(200, "Description is too long"),
  priceCents: z
    .number({ message: "Price must be a number" })
    .int("Price must be a whole number of cents")
    .min(0, "Price cannot be negative")
    .max(1_000_000, "Price is unrealistic"),
});

export const updateShippingSettingsSchema = z.object({
  sameDay: methodSchema,
  standard: methodSchema,
  taxRate: z
    .number({ message: "Tax rate must be a number" })
    .min(0, "Tax rate cannot be negative")
    .max(1, "Tax rate must be a decimal between 0 and 1"),
});

export type UpdateShippingSettingsInput = z.infer<
  typeof updateShippingSettingsSchema
>;
