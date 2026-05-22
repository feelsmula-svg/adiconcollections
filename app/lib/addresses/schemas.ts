import { z } from "zod";

export const addressInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Too long"),
  line1: z.string().trim().min(1, "Address line is required").max(200, "Too long"),
  line2: z.string().trim().max(200, "Too long").optional().default(""),
  city: z.string().trim().min(1, "City is required").max(120, "Too long"),
  state: z.string().trim().min(1, "State / region is required").max(120, "Too long"),
  postal: z.string().trim().min(1, "Postal code is required").max(40, "Too long"),
  country: z.string().trim().min(1, "Country is required").max(120, "Too long"),
  phone: z.string().trim().max(40, "Too long").optional().default(""),
  isDefaultShipping: z.boolean().optional().default(false),
  isDefaultBilling: z.boolean().optional().default(false),
});

export type AddressInputSchema = z.infer<typeof addressInputSchema>;
