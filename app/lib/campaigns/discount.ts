import "server-only";

import type { Campaign } from "./types";

export interface DiscountQuote {
  /** Cents to subtract from the cart subtotal. */
  subtotalDiscountCents: number;
  /** Cents to subtract from shipping (clamped to the shipping value). */
  shippingDiscountCents: number;
  /** Reason for the discount, surfaced in the cart UI. */
  description: string;
}

const EMPTY: DiscountQuote = {
  subtotalDiscountCents: 0,
  shippingDiscountCents: 0,
  description: "",
};

/**
 * Compute the discount a campaign offers on the given cart. Pure function —
 * relies on the campaign and the cart totals it was passed.
 */
export function quoteCampaignDiscount(
  campaign: Campaign,
  subtotalCents: number,
  shippingCents: number,
): DiscountQuote {
  if (!campaign.discount) return EMPTY;
  if (subtotalCents < campaign.discount.minSubtotalCents) return EMPTY;

  switch (campaign.discount.type) {
    case "percent": {
      const percent = Math.max(0, Math.min(100, campaign.discount.value));
      const value = Math.floor((subtotalCents * percent) / 100);
      return {
        subtotalDiscountCents: Math.min(value, subtotalCents),
        shippingDiscountCents: 0,
        description: `${percent}% off`,
      };
    }
    case "fixed": {
      const value = Math.max(0, Math.floor(campaign.discount.value));
      return {
        subtotalDiscountCents: Math.min(value, subtotalCents),
        shippingDiscountCents: 0,
        description: `$${(value / 100).toFixed(2)} off`,
      };
    }
    case "free-shipping":
      return {
        subtotalDiscountCents: 0,
        shippingDiscountCents: shippingCents,
        description: "Free shipping",
      };
    default:
      return EMPTY;
  }
}
