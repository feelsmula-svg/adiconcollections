import type { OrderStatus, ShippingCarrier } from "./types";
import { SHIPPING_CARRIER_LABELS } from "./types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  processing: "Processing",
  "in-transit": "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type OrderStatusTone =
  | "primary"
  | "secondary"
  | "tertiary"
  | "neutral"
  | "error";

export const ORDER_STATUS_TONE: Record<OrderStatus, OrderStatusTone> = {
  processing: "secondary",
  "in-transit": "primary",
  delivered: "tertiary",
  cancelled: "error",
};

/**
 * Step number along the fulfilment timeline (placed → processing → in-transit
 * → delivered). Cancelled orders sit outside the timeline; they get -1 so
 * timeline UIs can detect and treat them separately.
 */
export const ORDER_STATUS_INDEX: Record<OrderStatus, number> = {
  processing: 1,
  "in-transit": 2,
  delivered: 3,
  cancelled: -1,
};

export function formatOrderDate(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatOrderTimestamp(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;
  const date = new Date(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Display label for a shipping carrier. When the carrier is "other", the
 * admin-supplied freeform name takes precedence over the generic "Other"
 * label, falling back to "Other" if no name was entered.
 */
export function formatCarrier(
  carrier: ShippingCarrier | undefined,
  carrierName?: string,
): string | undefined {
  if (!carrier) return undefined;
  if (carrier === "other") {
    const trimmed = carrierName?.trim();
    return trimmed && trimmed.length > 0
      ? trimmed
      : SHIPPING_CARRIER_LABELS.other;
  }
  return SHIPPING_CARRIER_LABELS[carrier];
}

export function formatCurrency(minorUnits: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(minorUnits / 100);
}
