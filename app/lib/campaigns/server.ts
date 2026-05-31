import "server-only";

import { unstable_cache } from "next/cache";

import { CACHE_TAGS } from "@/app/lib/cache/tags";
import { getCampaignRepository } from "./campaign-repository";
import type { Campaign } from "./types";

/**
 * Cached read of the active campaigns. Both the header banner and the modal
 * derive from this, so the layout pays at most one cached Mongo query per
 * render window instead of one per helper on every page.
 *
 * Busted via `revalidateTag(CACHE_TAGS.campaigns)` in the campaign actions.
 */
const getCachedActiveCampaigns = unstable_cache(
  async (): Promise<Campaign[]> => {
    const repo = await getCampaignRepository();
    return repo.listActive();
  },
  ["active-campaigns"],
  { tags: [CACHE_TAGS.campaigns], revalidate: 120 },
);

/**
 * The campaign currently shown in the top header banner. The first active
 * campaign with `showInHeader` wins.
 */
export async function getHeaderCampaign(): Promise<Campaign | null> {
  const active = await getCachedActiveCampaigns();
  return active.find((c) => c.showInHeader && c.headerText) ?? null;
}

/**
 * Active campaigns that should pop up as a modal. Customers dismiss them on
 * the client and we remember the dismissal in localStorage by campaign id.
 */
export async function getModalCampaigns(): Promise<Campaign[]> {
  const active = await getCachedActiveCampaigns();
  return active.filter((c) => c.showModal && c.modalTitle);
}
