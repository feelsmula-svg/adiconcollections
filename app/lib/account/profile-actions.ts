"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSessionUser, toPublicUser } from "@/app/lib/auth/server";
import { getUserRepository } from "@/app/lib/auth/user-repository";
import type { PublicUser } from "@/app/lib/auth/types";

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name is too long"),
  phone: z
    .string()
    .trim()
    .max(40, "Phone is too long")
    .optional()
    .nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export interface UpdateProfileResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  user?: PublicUser;
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  const session = await getSessionUser();
  if (!session) {
    return { ok: false, error: "Sign in to update your profile" };
  }

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const repo = await getUserRepository();
  const updated = await repo.updateProfile(session.id, {
    name: parsed.data.name,
    phone: parsed.data.phone ?? null,
  });
  if (!updated) {
    return { ok: false, error: "Profile could not be updated" };
  }

  revalidatePath("/account");
  revalidatePath("/account/profile");
  return { ok: true, user: toPublicUser(updated) };
}
