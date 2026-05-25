"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/app/lib/auth/server";
import { getStoreProfileRepository } from "./store-profile-repository";
import {
  updateStoreProfileSchema,
  type UpdateStoreProfileInput,
} from "./schemas";
import type { StoreProfileSettings } from "./types";

export interface UpdateStoreProfileResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  settings?: StoreProfileSettings;
}

export async function getStoreProfile(): Promise<StoreProfileSettings> {
  const repo = await getStoreProfileRepository();
  return repo.get();
}

export async function updateStoreProfile(
  input: UpdateStoreProfileInput,
): Promise<UpdateStoreProfileResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Admin access required" };
  }

  const parsed = updateStoreProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const repo = await getStoreProfileRepository();
  const settings = await repo.update({
    brandName: parsed.data.brandName,
    supportEmail: parsed.data.supportEmail,
    currency: parsed.data.currency,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin", "layout");
  return { ok: true, settings };
}
