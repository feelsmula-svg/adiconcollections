import { z } from "zod";

const tierSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Tier id is required")
    .max(64, "Tier id is too long"),
  label: z
    .string()
    .trim()
    .min(1, "Label is required")
    .max(120, "Label is too long"),
  points: z
    .number({ message: "Points must be a number" })
    .int("Points must be a whole number")
    .min(1, "Points must be at least 1")
    .max(1_000_000, "Points value is unrealistic"),
  blurb: z
    .string()
    .trim()
    .max(200, "Description is too long")
    .optional()
    .default(""),
});

export const updateRewardsSettingsSchema = z.object({
  enabled: z.boolean(),
  displayToCustomers: z.boolean(),
  pointsPerDollar: z
    .number({ message: "Points per dollar must be a number" })
    .min(0, "Cannot be negative")
    .max(100, "100 is the maximum"),
  tiers: z.array(tierSchema).max(20, "Too many tiers"),
});

export type UpdateRewardsSettingsInput = z.infer<
  typeof updateRewardsSettingsSchema
>;
