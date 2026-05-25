export interface ShippingMethodConfig {
  label: string;
  description: string;
  priceCents: number;
}

export interface ShippingSettings {
  sameDay: ShippingMethodConfig;
  standard: ShippingMethodConfig;
  /** Decimal tax rate applied to subtotal (e.g. 0.0825 for 8.25%). */
  taxRate: number;
  updatedAt: string;
}

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  sameDay: {
    label: "Express Next-Day",
    description: "Order before 11 AM ET for next-business-day delivery.",
    priceCents: 2499,
  },
  standard: {
    label: "Standard (3–5 days)",
    description: "Available nationwide across the contiguous US.",
    priceCents: 799,
  },
  taxRate: 0.0825,
  updatedAt: new Date(0).toISOString(),
};
