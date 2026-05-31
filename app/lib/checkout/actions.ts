"use server";

import { revalidatePath } from "next/cache";
import type Stripe from "stripe";

import { getSessionUser } from "@/app/lib/auth/server";
import { getOrderRepository } from "@/app/lib/orders/order-repository";
import type { OrderRecord } from "@/app/lib/orders/types";
import { getStripe } from "@/app/lib/stripe/server";

export interface ConfirmCheckoutResult {
  ok: boolean;
  error?: string;
  order?: OrderRecord;
  status?: "succeeded" | "processing" | "failed";
}

export async function confirmCheckoutByPaymentIntent(
  paymentIntentId: string,
): Promise<ConfirmCheckoutResult> {
  const trimmed = paymentIntentId.trim();
  if (!trimmed) {
    return { ok: false, error: "Missing payment reference" };
  }
  const session = await getSessionUser();
  if (!session) {
    return { ok: false, error: "Sign in to view this order" };
  }

  let stripeStatus: "succeeded" | "processing" | "failed" = "processing";
  let card: Stripe.PaymentMethod.Card | undefined;
  try {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(trimmed, {
      expand: ["latest_charge.payment_method_details"],
    });
    if (intent.status === "succeeded") stripeStatus = "succeeded";
    else if (intent.status === "processing") stripeStatus = "processing";
    else stripeStatus = "failed";

    const charge =
      typeof intent.latest_charge === "object" && intent.latest_charge !== null
        ? (intent.latest_charge as Stripe.Charge)
        : null;
    const cardLike = charge?.payment_method_details?.card;
    if (cardLike) {
      card = cardLike as unknown as Stripe.PaymentMethod.Card;
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Could not verify payment";
    return { ok: false, error: message };
  }

  const repo = await getOrderRepository();
  let order = await repo.findByPaymentIntent(trimmed);
  if (!order) {
    return {
      ok: false,
      error:
        stripeStatus === "succeeded"
          ? "Payment succeeded but the order record was not found. Please contact support."
          : "No order found for this payment.",
      status: stripeStatus,
    };
  }
  if (order.userId !== session.id && session.role !== "admin") {
    return { ok: false, error: "Order not found" };
  }

  // Reconcile state: if Stripe says the payment failed, cancel the order
  // (webhook handles this too but this catches users who reload the page).
  if (stripeStatus === "failed" && order.status !== "cancelled") {
    const cancelled = await repo.cancelOrder(order.id, {
      actor: { email: session.email },
      reason: "Payment was not completed at Stripe",
    });
    if (cancelled) order = cancelled;
  }

  // Server-verified paid: Stripe (the authority) confirms the PI succeeded, so
  // flip the order to paid even if the webhook hasn't arrived. Idempotent.
  if (stripeStatus === "succeeded") {
    const paid = await repo.markPaidByPaymentIntent(trimmed);
    if (paid) order = paid;
  }

  // Surface card brand/last4 to the customer once Stripe has them.
  if (card && (!order.payment.last4 || order.payment.last4 === "••••")) {
    const brand = card.brand
      ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1)
      : order.payment.brand;
    const last4 = card.last4 ?? order.payment.last4;
    const expiry = card.exp_month
      ? `${String(card.exp_month).padStart(2, "0")}/${String(card.exp_year ?? "").slice(-2)}`
      : order.payment.expiry;
    order = { ...order, payment: { brand, last4, expiry } };
  }

  revalidatePath("/account");
  revalidatePath("/account/orders");
  return { ok: true, order, status: stripeStatus };
}
