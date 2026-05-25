"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/app/lib/auth/server";
import { getShippingSettingsRepository } from "./shipping-settings-repository";
import {
  updateShippingSettingsSchema,
  type UpdateShippingSettingsInput,
} from "./schemas";
import type { ShippingSettings } from "./types";

export interface UpdateShippingSettingsResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  settings?: ShippingSettings;
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  const repo = await getShippingSettingsRepository();
  return repo.get();
}

export async function updateShippingSettings(
  input: UpdateShippingSettingsInput,
): Promise<UpdateShippingSettingsResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Admin access required" };
  }

  const parsed = updateShippingSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const repo = await getShippingSettingsRepository();
  const settings = await repo.update({
    sameDay: parsed.data.sameDay,
    standard: parsed.data.standard,
    taxRate: parsed.data.taxRate,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return { ok: true, settings };
}
