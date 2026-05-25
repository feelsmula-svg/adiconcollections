import "server-only";

import type Stripe from "stripe";

import { getStripe } from "@/app/lib/stripe/server";

import type { OrderRecord, OrderRefund } from "./types";

export type RefundOutcome =
  | { kind: "refunded"; refund: OrderRefund }
  | { kind: "payment-cancelled"; refund: OrderRefund }
  | { kind: "already-refunded"; refund: OrderRefund }
  | { kind: "no-payment" }
  | { kind: "failed"; reason: string };

/**
 * Issues a full refund (or cancels the PaymentIntent if the customer was
 * never charged) for the given order. Never throws — Stripe errors are
 * returned as `{ kind: "failed" }` so the caller can still complete the
 * cancellation flow and surface the failure to the admin.
 */
export async function attemptFullRefund(
  order: OrderRecord,
): Promise<RefundOutcome> {
  if (!order.paymentIntentId) {
    return { kind: "no-payment" };
  }

  if (order.refund && order.refund.status !== "failed") {
    // Idempotent: a prior refund attempt already created a Stripe refund
    // (or cancelled the PI). Don't double-charge ourselves.
    return { kind: "already-refunded", refund: order.refund };
  }

  const stripe = getStripe();
  const now = new Date().toISOString();

  let intent: Stripe.PaymentIntent;
  try {
    intent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
  } catch (error: unknown) {
    return { kind: "failed", reason: stripeErrorMessage(error) };
  }

  // If the customer never finished paying, cancel the PI instead of
  // refunding (there's nothing to refund yet).
  if (CANCELLABLE_PI_STATUSES.has(intent.status)) {
    try {
      await stripe.paymentIntents.cancel(intent.id, {
        cancellation_reason: "requested_by_customer",
      });
    } catch (error: unknown) {
      const reason = stripeErrorMessage(error);
      // If Stripe says it's already cancelled, treat as success.
      if (!/already.*cancel/i.test(reason)) {
        return { kind: "failed", reason };
      }
    }
    const refund: OrderRefund = {
      status: "cancelled",
      amount: order.totals.total,
      createdAt: now,
      completedAt: now,
      paymentCancelled: true,
    };
    return { kind: "payment-cancelled", refund };
  }

  if (!REFUNDABLE_PI_STATUSES.has(intent.status)) {
    return {
      kind: "failed",
      reason: `Payment is in status "${intent.status}" and cannot be refunded automatically.`,
    };
  }

  let stripeRefund: Stripe.Refund;
  try {
    stripeRefund = await stripe.refunds.create(
      {
        payment_intent: intent.id,
        reason: "requested_by_customer",
        metadata: {
          orderId: order.id,
          orderReference: order.reference,
        },
      },
      {
        // Same order ⇒ same key, so retried calls don't create duplicate refunds.
        idempotencyKey: `order-refund:${order.id}`,
      },
    );
  } catch (error: unknown) {
    return { kind: "failed", reason: stripeErrorMessage(error) };
  }

  const refund: OrderRefund = {
    stripeRefundId: stripeRefund.id,
    status: mapStripeRefundStatus(stripeRefund.status),
    amount: stripeRefund.amount / 100,
    createdAt: now,
    completedAt:
      stripeRefund.status === "succeeded" || stripeRefund.status === "failed"
        ? now
        : undefined,
    failureReason:
      stripeRefund.status === "failed"
        ? (stripeRefund.failure_reason ?? "Stripe reported refund failed.")
        : undefined,
  };

  return { kind: "refunded", refund };
}

/**
 * Builds an OrderRefund from a Stripe Refund object (used by the webhook to
 * sync status transitions like pending → succeeded after the bank settles).
 */
export function refundFromStripe(stripeRefund: Stripe.Refund): OrderRefund {
  const status = mapStripeRefundStatus(stripeRefund.status);
  return {
    stripeRefundId: stripeRefund.id,
    status,
    amount: stripeRefund.amount / 100,
    createdAt: new Date(stripeRefund.created * 1000).toISOString(),
    completedAt:
      status === "succeeded" || status === "failed"
        ? new Date().toISOString()
        : undefined,
    failureReason:
      status === "failed"
        ? (stripeRefund.failure_reason ?? "Stripe reported refund failed.")
        : undefined,
  };
}

const CANCELLABLE_PI_STATUSES = new Set<Stripe.PaymentIntent.Status>([
  "requires_payment_method",
  "requires_capture",
  "requires_confirmation",
  "requires_action",
]);

const REFUNDABLE_PI_STATUSES = new Set<Stripe.PaymentIntent.Status>([
  "succeeded",
  "processing",
]);

function mapStripeRefundStatus(
  status: string | null | undefined,
): OrderRefund["status"] {
  switch (status) {
    case "succeeded":
      return "succeeded";
    case "failed":
      return "failed";
    case "canceled":
      return "cancelled";
    case "pending":
    case "requires_action":
    case null:
    case undefined:
    default:
      return "pending";
  }
}

function stripeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown Stripe error";
}
