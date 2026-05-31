import { NextResponse } from "next/server";

import { AdminAccessError, requireAdmin } from "@/app/lib/auth/server";
import { notifyUser } from "@/app/lib/notifications/notify";
import { ORDER_STATUS_LABEL, formatCarrier } from "@/app/lib/orders/format";
import { getOrderRepository } from "@/app/lib/orders/order-repository";
import { attemptFullRefund, type RefundOutcome } from "@/app/lib/orders/refund";
import { orderActionSchema } from "@/app/lib/orders/schemas";
import type {
  OrderRecord,
  OrderRefund,
  ShippingCarrier,
} from "@/app/lib/orders/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function isJson(request: Request): boolean {
  const ct = request.headers.get("content-type") ?? "";
  return ct.toLowerCase().startsWith("application/json");
}

export async function POST(request: Request, context: RouteContext) {
  let actorEmail: string;
  try {
    const admin = await requireAdmin();
    actorEmail = admin.email;
  } catch (error: unknown) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }
    throw error;
  }

  if (!isJson(request)) {
    return NextResponse.json(
      { success: false, error: "Content-Type must be application/json" },
      { status: 415 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = orderActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const repo = await getOrderRepository();
  const actor = { email: actorEmail };
  const input = parsed.data;

  let updated: OrderRecord | null = null;
  let refundOutcome: RefundOutcome | null = null;
  switch (input.action) {
    case "advance":
      updated = await repo.advanceStage(id, { actor });
      break;
    case "revert":
      updated = await repo.revertStage(id, { actor });
      break;
    case "cancel": {
      updated = await repo.cancelOrder(id, { actor, reason: input.reason });
      if (updated) {
        refundOutcome = await attemptFullRefund(updated);
        if (refundOutcome.kind !== "no-payment") {
          const refundRecord = refundOutcome.kind === "failed"
            ? buildFailedRefundRecord(updated, refundOutcome.reason)
            : refundOutcome.refund;
          const withRefund = await repo.recordRefund(id, {
            actor,
            refund: refundRecord,
          });
          if (withRefund) updated = withRefund;
        }
      }
      break;
    }
    case "restore":
      updated = await repo.restoreOrder(id, { actor });
      break;
    case "update-shipping":
      updated = await repo.updateShipping(id, {
        actor,
        carrier: input.carrier as ShippingCarrier | undefined,
        carrierName: input.carrierName ?? undefined,
        trackingNumber: input.trackingNumber ?? undefined,
      });
      break;
    case "update-notes":
      updated = await repo.updateNotes(id, {
        actor,
        adminNotes: input.adminNotes,
      });
      break;
    case "update-expected-delivery": {
      const value =
        input.expectedDelivery && input.expectedDelivery.length > 0
          ? input.expectedDelivery
          : null;
      updated = await repo.updateExpectedDelivery(id, {
        actor,
        expectedDelivery: value,
      });
      break;
    }
    case "update-signature":
      updated = await repo.updateSignature(id, {
        actor,
        requiresSignature: input.requiresSignature,
      });
      break;
  }

  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Order not found" },
      { status: 404 },
    );
  }

  // Best-effort customer notification for the actions that actually change
  // what the customer sees in their order timeline.
  void notifyCustomer(input.action, updated, refundOutcome);

  return NextResponse.json({ success: true, data: updated });
}

function buildFailedRefundRecord(
  order: OrderRecord,
  reason: string,
): OrderRefund {
  const now = new Date().toISOString();
  return {
    status: "failed",
    // OrderTotals are in cents; OrderRefund.amount is in dollars.
    amount: order.totals.total / 100,
    createdAt: now,
    completedAt: now,
    failureReason: reason,
  };
}

function refundCopy(outcome: RefundOutcome | null, order: OrderRecord): string {
  if (!outcome) return "";
  const amount = `$${order.totals.total.toFixed(2)}`;
  switch (outcome.kind) {
    case "no-payment":
      return "";
    case "payment-cancelled":
      return " We cancelled the pending payment, so no charge will appear on your card.";
    case "refunded": {
      if (outcome.refund.status === "succeeded") {
        return ` We've issued a full refund of ${amount} — it should appear on your original card immediately.`;
      }
      return ` We've issued a full refund of ${amount} to your original card. Most banks settle the funds within 3–10 business days.`;
    }
    case "already-refunded":
      return ` A refund of ${amount} for this order is already in progress.`;
    case "failed":
      return ` We couldn't issue your refund automatically — our team will follow up to make sure ${amount} is returned.`;
  }
}

async function notifyCustomer(
  action: string,
  order: OrderRecord,
  refundOutcome: RefundOutcome | null,
): Promise<void> {
  if (!order.userId) return;

  const link = `/account/orders/${order.id}`;
  const statusLabel = ORDER_STATUS_LABEL[order.status];

  switch (action) {
    case "advance":
      await notifyUser({
        userId: order.userId,
        kind: "order-placed",
        title: `Order ${order.reference}: ${statusLabel}`,
        body: `Your order has moved to ${statusLabel.toLowerCase()}. We'll keep you posted with each next step.`,
        link,
        email: order.customerEmail,
        emailSubject: `Order ${order.reference} update — ${statusLabel}`,
      });
      break;
    case "revert":
      await notifyUser({
        userId: order.userId,
        kind: "order-placed",
        title: `Order ${order.reference} stepped back to ${statusLabel}`,
        body: "We've adjusted the tracking on your order. Reach out if you have any questions.",
        link,
      });
      break;
    case "cancel": {
      const reasonBody =
        order.cancellationReason ??
        "Your order has been cancelled. If this is unexpected, please reply to this notification or contact us.";
      const body = `${reasonBody}${refundCopy(refundOutcome, order)}`;
      await notifyUser({
        userId: order.userId,
        kind: "order-cancelled",
        title: `Order ${order.reference} cancelled`,
        body,
        link,
        email: order.customerEmail,
        emailSubject: `Order ${order.reference} cancelled`,
      });
      break;
    }
    case "restore":
      await notifyUser({
        userId: order.userId,
        kind: "order-placed",
        title: `Order ${order.reference} restored`,
        body: "Good news — your order is back on track.",
        link,
        email: order.customerEmail,
        emailSubject: `Order ${order.reference} restored`,
      });
      break;
    case "update-shipping":
      await notifyUser({
        userId: order.userId,
        kind: "order-placed",
        title: `Tracking info updated for ${order.reference}`,
        body: order.trackingNumber
          ? `${formatCarrier(order.carrier, order.carrierName) ?? "Carrier"} · Tracking ${order.trackingNumber}`
          : "We've updated the shipping details on your order.",
        link,
      });
      break;
    case "update-expected-delivery":
      await notifyUser({
        userId: order.userId,
        kind: "order-placed",
        title: `New delivery estimate for ${order.reference}`,
        body: order.expectedDelivery
          ? `Now expected ${order.expectedDelivery}.`
          : "We've removed the delivery estimate while we sort logistics.",
        link,
      });
      break;
    default:
      // Other actions (notes, signature) are admin-internal — no customer-facing notification.
      break;
  }
}
