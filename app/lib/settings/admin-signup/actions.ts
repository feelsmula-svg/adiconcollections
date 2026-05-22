"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/app/lib/auth/server";
import { getAdminSignupSettingsRepository } from "./repository";
import {
  updateAdminSignupSettingsSchema,
  type UpdateAdminSignupSettingsInput,
} from "./schemas";
import type { AdminSignupSettings } from "./types";

export interface UpdateAdminSignupSettingsResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  settings?: AdminSignupSettings;
}

export async function getAdminSignupSettings(): Promise<AdminSignupSettings> {
  const repo = await getAdminSignupSettingsRepository();
  return repo.get();
}

export async function updateAdminSignupSettings(
  input: UpdateAdminSignupSettingsInput,
): Promise<UpdateAdminSignupSettingsResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Admin access required" };
  }

  const parsed = updateAdminSignupSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const repo = await getAdminSignupSettingsRepository();
  const settings = await repo.update({
    enabled: parsed.data.enabled,
    inviteCode: parsed.data.inviteCode ?? "",
  });

  revalidatePath("/admin/settings");
  revalidatePath("/auth/admin-signup");
  return { ok: true, settings };
}
