import {
  SHIPPING_CARRIER_LABELS,
  type ActivityKind,
  type OrderActivityEntry,
  type OrderRecord,
} from "@/app/lib/orders/types";
import { formatOrderDate } from "@/app/lib/orders/format";

export type PromptTone =
  | "primary"
  | "secondary"
  | "tertiary"
  | "neutral"
  | "error";

export interface SystemPrompt {
  id: string;
  orderId: string;
  orderReference: string;
  productName: string;
  timestamp: string;
  kind: ActivityKind;
  icon: string;
  tone: PromptTone;
  title: string;
  body?: string;
  actorEmail?: string;
}

const ICON: Record<ActivityKind, string> = {
  placed: "receipt_long",
  advanced: "local_shipping",
  reverted: "undo",
  cancelled: "cancel",
  restored: "restart_alt",
  "shipping-updated": "local_shipping",
  "notes-updated": "edit_note",
  "expected-delivery-updated": "event",
  "signature-updated": "draw",
};

const TONE: Record<ActivityKind, PromptTone> = {
  placed: "primary",
  advanced: "secondary",
  reverted: "neutral",
  cancelled: "error",
  restored: "secondary",
  "shipping-updated": "secondary",
  "notes-updated": "neutral",
  "expected-delivery-updated": "tertiary",
  "signature-updated": "neutral",
};

function extractAdvancedTo(message: string): string | null {
  const match = message.match(/to\s+["“](.+?)["”]/);
  return match ? match[1] : null;
}

function carrierLabel(order: OrderRecord): string {
  return order.carrier ? SHIPPING_CARRIER_LABELS[order.carrier] : "the carrier";
}

function blurbForStep(step: string): string | undefined {
  const normalized = step.toLowerCase();
  if (normalized.includes("place")) {
    return "We've received your order and will start preparing it shortly.";
  }
  if (normalized.includes("process")) {
    return "Your pieces are being prepared and quality-checked.";
  }
  if (normalized.includes("ship")) {
    return "Your order is on its way.";
  }
  if (normalized.includes("out for delivery")) {
    return "Your order is out for delivery and arriving soon.";
  }
  if (normalized.includes("deliver")) {
    return "Your order has been delivered. Enjoy!";
  }
  return undefined;
}

interface CustomerCopy {
  title: string;
  body?: string;
}

function customerCopyFor(
  entry: OrderActivityEntry,
  order: OrderRecord,
): CustomerCopy | null {
  switch (entry.kind) {
    case "placed":
      return {
        title: "Order placed",
        body: "We've received your order and will start preparing it shortly.",
      };
    case "advanced": {
      const step = extractAdvancedTo(entry.message);
      if (!step) {
        return { title: "Your order status was updated" };
      }
      return {
        title: `Status: ${step}`,
        body: blurbForStep(step),
      };
    }
    case "cancelled":
      return {
        title: "Your order was cancelled",
        body: order.cancellationReason
          ? `Reason: ${order.cancellationReason}`
          : undefined,
      };
    case "restored":
      return {
        title: "Your order has been reinstated",
        body: "Tracking will resume from the last completed step.",
      };
    case "shipping-updated": {
      const carrier = carrierLabel(order);
      const tn = order.trackingNumber;
      return {
        title: "Shipping details updated",
        body: tn
          ? `${carrier} · Tracking #${tn}`
          : `Carrier set to ${carrier}.`,
      };
    }
    case "expected-delivery-updated": {
      const date = order.expectedDelivery
        ? formatOrderDate(order.expectedDelivery)
        : null;
      return {
        title: "Estimated delivery updated",
        body: date ? `New estimated delivery: ${date}.` : undefined,
      };
    }
    case "signature-updated":
      return {
        title: order.requiresSignature
          ? "Signature now required at delivery"
          : "Signature no longer required",
      };
    case "reverted":
    case "notes-updated":
      return null;
    default:
      return null;
  }
}

interface AdminCopy {
  title: string;
  body?: string;
}

function adminCopyFor(
  entry: OrderActivityEntry,
  order: OrderRecord,
): AdminCopy {
  switch (entry.kind) {
    case "placed":
      return {
        title: `New order from ${order.customerName || order.customerEmail}`,
        body: order.productName,
      };
    case "advanced":
      return { title: entry.message };
    case "reverted":
      return { title: entry.message };
    case "cancelled":
      return {
        title: "Order cancelled",
        body: order.cancellationReason
          ? `Reason: ${order.cancellationReason}`
          : undefined,
      };
    case "restored":
      return { title: "Order restored from cancelled" };
    case "shipping-updated":
      return {
        title: "Shipping details updated",
        body:
          order.carrier || order.trackingNumber
            ? `${order.carrier ? SHIPPING_CARRIER_LABELS[order.carrier] : "Carrier unset"}${
                order.trackingNumber ? ` · #${order.trackingNumber}` : ""
              }`
            : undefined,
      };
    case "notes-updated":
      return {
        title: "Internal notes updated",
        body: order.adminNotes
          ? order.adminNotes.length > 80
            ? `${order.adminNotes.slice(0, 80)}…`
            : order.adminNotes
          : undefined,
      };
    case "expected-delivery-updated":
      return {
        title: "Expected delivery updated",
        body: order.expectedDelivery
          ? formatOrderDate(order.expectedDelivery)
          : undefined,
      };
    case "signature-updated":
      return {
        title: order.requiresSignature
          ? "Signature now required"
          : "Signature requirement removed",
      };
  }
}

function basePrompt(
  entry: OrderActivityEntry,
  order: OrderRecord,
  copy: { title: string; body?: string },
): SystemPrompt {
  return {
    id: entry.id,
    orderId: order.id,
    orderReference: order.reference,
    productName: order.productName,
    timestamp: entry.timestamp,
    kind: entry.kind,
    icon: ICON[entry.kind],
    tone: TONE[entry.kind],
    title: copy.title,
    body: copy.body,
    actorEmail: entry.actorEmail,
  };
}

export function customerPromptsFor(order: OrderRecord): SystemPrompt[] {
  const entries = order.activity ?? [];
  return entries
    .map((entry) => {
      const copy = customerCopyFor(entry, order);
      return copy ? basePrompt(entry, order, copy) : null;
    })
    .filter((p): p is SystemPrompt => p !== null)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

export function adminPromptsFor(order: OrderRecord): SystemPrompt[] {
  const entries = order.activity ?? [];
  return entries
    .map((entry) => basePrompt(entry, order, adminCopyFor(entry, order)))
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

export function recentCustomerPrompts(
  orders: OrderRecord[],
  limit = 5,
): SystemPrompt[] {
  return orders
    .flatMap((order) => customerPromptsFor(order))
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, limit);
}

export function recentAdminPrompts(
  orders: OrderRecord[],
  limit = 5,
): SystemPrompt[] {
  return orders
    .flatMap((order) => adminPromptsFor(order))
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, limit);
}
