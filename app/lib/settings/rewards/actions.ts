"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/app/lib/auth/server";
import { getRewardsSettingsRepository } from "./rewards-settings-repository";
import {
  updateRewardsSettingsSchema,
  type UpdateRewardsSettingsInput,
} from "./schemas";
import type { RewardsSettings } from "./types";

export interface UpdateRewardsSettingsResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  settings?: RewardsSettings;
}

export async function getRewardsSettings(): Promise<RewardsSettings> {
  const repo = await getRewardsSettingsRepository();
  return repo.get();
}

export async function updateRewardsSettings(
  input: UpdateRewardsSettingsInput,
): Promise<UpdateRewardsSettingsResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Admin access required" };
  }

  const parsed = updateRewardsSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const repo = await getRewardsSettingsRepository();
  const settings = await repo.update({
    enabled: parsed.data.enabled,
    displayToCustomers: parsed.data.displayToCustomers,
    pointsPerDollar: parsed.data.pointsPerDollar,
    tiers: parsed.data.tiers.map((tier) => ({
      id: tier.id,
      label: tier.label,
      points: tier.points,
      blurb: tier.blurb ?? "",
    })),
  });

  revalidatePath("/admin/settings");
  revalidatePath("/account");
  revalidatePath("/account/orders");
  return { ok: true, settings };
}
