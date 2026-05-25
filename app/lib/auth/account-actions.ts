"use server";

import { revalidatePath } from "next/cache";

import { changePasswordSchema, type ChangePasswordInput } from "./schemas";
import {
  getSessionUser,
  hashPassword,
  verifyPassword,
} from "./server";
import { getUserRepository } from "./user-repository";

export interface ChangePasswordResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export async function changePassword(
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  const session = await getSessionUser();
  if (!session) {
    return { ok: false, error: "You must be signed in to change your password" };
  }

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const repo = await getUserRepository();
  const user = await repo.findById(session.id);
  if (!user) {
    return { ok: false, error: "Account not found" };
  }

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!valid) {
    return {
      ok: false,
      error: "Current password is incorrect",
      fieldErrors: { currentPassword: ["Current password is incorrect"] },
    };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  const updated = await repo.updatePassword(user.id, passwordHash);
  if (!updated) {
    return { ok: false, error: "Could not update password" };
  }

  revalidatePath("/account/profile");
  return { ok: true };
}
