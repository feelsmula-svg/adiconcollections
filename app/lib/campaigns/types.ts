export type CampaignDiscountType = "percent" | "fixed" | "free-shipping";

export interface CampaignDiscount {
  type: CampaignDiscountType;
  /**
   * For `percent` this is 0–100 (whole numbers). For `fixed` this is cents.
   * For `free-shipping` the value is ignored.
   */
  value: number;
  /** Minimum cart subtotal in cents required to qualify. */
  minSubtotalCents: number;
}

export interface Campaign {
  id: string;
  /** Internal name for the admin list view. */
  name: string;
  /** Short text shown in the top site header banner. */
  headerText?: string;
  /** Modal heading shown to customers. */
  modalTitle?: string;
  /** Modal body text. */
  modalBody?: string;
  /** Optional CTA button label inside the modal. */
  ctaLabel?: string;
  /** Optional CTA destination — internal path only. */
  ctaHref?: string;
  /** Promo code customers can enter to claim the discount. */
  promoCode?: string;
  /** Discount details — present whenever the campaign offers a promo. */
  discount?: CampaignDiscount;
  /** Whether the campaign should show in the header. */
  showInHeader: boolean;
  /** Whether the campaign should pop up as a modal on first visit. */
  showModal: boolean;
  /** Master enabled flag. */
  enabled: boolean;
  /** Optional schedule. */
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function isCampaignLive(
  campaign: Campaign,
  now = new Date(),
): boolean {
  if (!campaign.enabled) return false;
  if (campaign.startsAt && new Date(campaign.startsAt) > now) return false;
  if (campaign.endsAt && new Date(campaign.endsAt) < now) return false;
  return true;
}
