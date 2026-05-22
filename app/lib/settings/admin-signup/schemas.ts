import { z } from "zod";

export const updateAdminSignupSettingsSchema = z.object({
  enabled: z.boolean(),
  inviteCode: z
    .string()
    .trim()
    .max(120, "Invite code is too long")
    .optional()
    .default(""),
});

export type UpdateAdminSignupSettingsInput = z.infer<
  typeof updateAdminSignupSettingsSchema
>;
