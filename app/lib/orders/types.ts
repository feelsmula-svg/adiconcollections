export type OrderStatus =
  | "processing"
  | "in-transit"
  | "delivered"
  | "cancelled";

export const ORDER_STATUSES: readonly OrderStatus[] = [
  "processing",
  "in-transit",
  "delivered",
  "cancelled",
] as const;

export type TrackingStepKey =
  | "placed"
  | "processing"
  | "shipped"
  | "out-for-delivery"
  | "delivered";

export const TRACKING_STEP_KEYS: readonly TrackingStepKey[] = [
  "placed",
  "processing",
  "shipped",
  "out-for-delivery",
  "delivered",
] as const;

export const TRACKING_STEP_LABELS: Record<TrackingStepKey, string> = {
  placed: "Order placed",
  processing: "Processing",
  shipped: "Shipped",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
};

export const TRACKING_STEP_TO_STATUS: Record<TrackingStepKey, OrderStatus> = {
  placed: "processing",
  processing: "processing",
  shipped: "in-transit",
  "out-for-delivery": "in-transit",
  delivered: "delivered",
};

/**
 * Payment lifecycle, independent of the fulfilment `status`. New orders start
 * "pending" and flip to "paid" once Stripe confirms (webhook or the
 * server-verified checkout confirmation). Legacy orders predate this field —
 * an absent value is treated as paid so historical revenue is preserved.
 */
export type PaymentStatus = "pending" | "paid" | "failed";

/**
 * Whether an order should count as a real sale (revenue, analytics). Legacy
 * orders with no `paymentStatus` count as paid; only explicitly "pending" or
 * "failed" orders are excluded.
 */
export function isPaidOrder(order: { paymentStatus?: PaymentStatus }): boolean {
  return order.paymentStatus !== "pending" && order.paymentStatus !== "failed";
}

export type ShippingCarrier = "fedex" | "ups" | "usps" | "dhl" | "other";

export const SHIPPING_CARRIERS: readonly ShippingCarrier[] = [
  "fedex",
  "ups",
  "usps",
  "dhl",
  "other",
] as const;

export const SHIPPING_CARRIER_LABELS: Record<ShippingCarrier, string> = {
  fedex: "FedEx",
  ups: "UPS",
  usps: "USPS",
  dhl: "DHL",
  other: "Other",
};

export type ActivityKind =
  | "placed"
  | "advanced"
  | "reverted"
  | "cancelled"
  | "restored"
  | "shipping-updated"
  | "notes-updated"
  | "expected-delivery-updated"
  | "signature-updated"
  | "refund-issued"
  | "refund-updated"
  | "refund-failed";

export type RefundStatus = "pending" | "succeeded" | "failed" | "cancelled";

export interface OrderRefund {
  /** Stripe refund ID. Absent when the PI was cancelled (no charge) or the refund couldn't be created. */
  stripeRefundId?: string;
  status: RefundStatus;
  /** Amount in dollars. NOTE: OrderTotals are in cents — divide by 100. */
  amount: number;
  createdAt: string;
  /** Set when the refund moves to a terminal state. */
  completedAt?: string;
  /** Set when status === "failed". */
  failureReason?: string;
  /**
   * When `true`, the underlying PaymentIntent was cancelled rather than
   * refunded — the customer was never actually charged.
   */
  paymentCancelled?: boolean;
}

export interface OrderActivityEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  kind: ActivityKind;
  message: string;
}

export type TrackingStepStatus = "complete" | "current" | "upcoming";

export interface TrackingStep {
  key: TrackingStepKey;
  label: string;
  timestamp?: string;
  status: TrackingStepStatus;
}

export interface OrderItem {
  id: string;
  collection: string;
  name: string;
  attributes: string;
  imageUrl: string;
  quantity: number;
  price: number;
}

export interface OrderAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal: string;
  country: string;
}

export interface OrderPayment {
  brand: string;
  last4: string;
  expiry: string;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface OrderSummary {
  id: string;
  reference: string;
  placedAt: string;
  status: OrderStatus;
  total: number;
  productName: string;
  expectedDelivery?: string;
  imageUrl?: string;
}

export type OrderDeliveryMethod = "same-day" | "standard";

export const DELIVERY_METHOD_LABEL: Record<OrderDeliveryMethod, string> = {
  "same-day": "Express Next-Day",
  standard: "Standard",
};

export const DELIVERY_METHOD_DAYS: Record<OrderDeliveryMethod, number> = {
  "same-day": 1,
  standard: 2,
};

export interface OrderRecord extends OrderSummary {
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  payment: OrderPayment;
  totals: OrderTotals;
  tracking: TrackingStep[];
  requiresSignature: boolean;
  carrier?: ShippingCarrier;
  /** Freeform carrier name, used only when `carrier` is "other". */
  carrierName?: string;
  /** Payment lifecycle. Absent on legacy orders (treated as paid). */
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  adminNotes?: string;
  cancellationReason?: string;
  activity?: OrderActivityEntry[];
  paymentIntentId?: string;
  deliveryMethod?: OrderDeliveryMethod;
  refund?: OrderRefund;
}

export type OrderDetail = OrderRecord;

export interface ListOrdersFilters {
  userId?: string;
  status?: OrderStatus;
  q?: string;
}
