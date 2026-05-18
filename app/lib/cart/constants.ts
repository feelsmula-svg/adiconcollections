export const TAX_RATE = 0.0825;

export type DeliveryMethod = "same-day" | "standard";

export const DELIVERY_COST_CENTS: Record<DeliveryMethod, number> = {
  "same-day": 2499,
  standard: 799,
};
