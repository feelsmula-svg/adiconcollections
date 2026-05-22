import "server-only";

import { getCampaignRepository } from "./campaign-repository";
import type { Campaign } from "./types";

/**
 * The campaign currently shown in the top header banner. The first active
 * campaign with `showInHeader` wins.
 */
export async function getHeaderCampaign(): Promise<Campaign | null> {
  const repo = await getCampaignRepository();
  const active = await repo.listActive();
  return active.find((c) => c.showInHeader && c.headerText) ?? null;
}

/**
 * Active campaigns that should pop up as a modal. Customers dismiss them on
 * the client and we remember the dismissal in localStorage by campaign id.
 */
export async function getModalCampaigns(): Promise<Campaign[]> {
  const repo = await getCampaignRepository();
  const active = await repo.listActive();
  return active.filter((c) => c.showModal && c.modalTitle);
}
