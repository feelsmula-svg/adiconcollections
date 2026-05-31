"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAdmin } from "@/app/lib/auth/server";
import { CACHE_TAGS } from "@/app/lib/cache/tags";
import { getCampaignRepository } from "./campaign-repository";
import { campaignSchema, type CampaignInput } from "./schemas";
import type { Campaign } from "./types";

export interface CampaignActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  campaign?: Campaign;
}

function normalise(input: CampaignInput) {
  return {
    name: input.name,
    headerText: input.headerText ? input.headerText : undefined,
    modalTitle: input.modalTitle ? input.modalTitle : undefined,
    modalBody: input.modalBody ? input.modalBody : undefined,
    ctaLabel: input.ctaLabel ? input.ctaLabel : undefined,
    ctaHref: input.ctaHref ? input.ctaHref : undefined,
    promoCode: input.promoCode ? input.promoCode : undefined,
    discount: input.discount,
    showInHeader: input.showInHeader,
    showModal: input.showModal,
    enabled: input.enabled,
    startsAt: input.startsAt ? input.startsAt : undefined,
    endsAt: input.endsAt ? input.endsAt : undefined,
  };
}

export async function createCampaign(
  input: CampaignInput,
): Promise<CampaignActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Admin access required" };
  }
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    const repo = await getCampaignRepository();
    const campaign = await repo.create(normalise(parsed.data));
    revalidatePath("/admin/marketing");
    revalidateTag(CACHE_TAGS.campaigns, "max");
    revalidatePath("/", "layout");
    return { ok: true, campaign };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Create failed";
    return { ok: false, error: message };
  }
}

export async function updateCampaign(
  id: string,
  input: CampaignInput,
): Promise<CampaignActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Admin access required" };
  }
  const trimmed = id.trim();
  if (!trimmed) return { ok: false, error: "Missing campaign id" };
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const repo = await getCampaignRepository();
  const campaign = await repo.update(trimmed, normalise(parsed.data));
  if (!campaign) return { ok: false, error: "Campaign not found" };
  revalidatePath("/admin/marketing");
  revalidateTag(CACHE_TAGS.campaigns, "max");
  revalidatePath("/", "layout");
  return { ok: true, campaign };
}

export async function deleteCampaign(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Admin access required" };
  }
  const trimmed = id.trim();
  if (!trimmed) return { ok: false, error: "Missing campaign id" };
  const repo = await getCampaignRepository();
  const ok = await repo.delete(trimmed);
  if (!ok) return { ok: false, error: "Campaign not found" };
  revalidatePath("/admin/marketing");
  revalidateTag(CACHE_TAGS.campaigns, "max");
  revalidatePath("/", "layout");
  return { ok: true };
}

export interface PromoValidationResult {
  ok: boolean;
  error?: string;
  campaign?: Campaign;
}

export async function validatePromoCode(
  code: string,
): Promise<PromoValidationResult> {
  const normalised = code.trim().toUpperCase();
  if (normalised.length === 0) {
    return { ok: false, error: "Enter a promo code" };
  }
  const repo = await getCampaignRepository();
  const campaign = await repo.findByPromoCode(normalised);
  if (!campaign) {
    return { ok: false, error: "That code isn't valid or has expired." };
  }
  if (!campaign.discount) {
    return {
      ok: false,
      error: "This campaign doesn't offer a checkout discount.",
    };
  }
  return { ok: true, campaign };
}
