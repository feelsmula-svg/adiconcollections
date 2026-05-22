import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { notifyAdmins, notifyUser } from "@/app/lib/notifications/notify";
import { getOrderRepository } from "@/app/lib/orders/order-repository";
import { getStripe } from "@/app/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_ACTOR_EMAIL = "system@stripe.webhook";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.error(
      "[stripe/webhook] STRIPE_WEBHOOK_SECRET is not configured. Refusing to process webhook to prevent forged events.",
    );
    return NextResponse.json(
      { error: "Webhook is not configured" },
      { status: 500 },
    );
  }
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Invalid Stripe signature";
    console.error("[stripe/webhook] signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.payment_failed":
      case "payment_intent.canceled":
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        // ignore other events
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Webhook handler failed";
    console.error("[stripe/webhook] handler error:", event.type, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handlePaymentFailure(intent: Stripe.PaymentIntent): Promise<void> {
  const repo = await getOrderRepository();
  const order = await repo.findByPaymentIntent(intent.id);
  if (!order) return;
  if (order.status === "cancelled") return;
  const reason =
    intent.last_payment_error?.message ??
    (intent.status === "canceled"
      ? "Payment cancelled at Stripe"
      : "Payment failed at Stripe");
  await repo.cancelOrder(order.id, {
    actor: { email: SYSTEM_ACTOR_EMAIL },
    reason,
  });
  void notifyAdmins({
    kind: "order-cancelled",
    title: `Order ${order.reference} cancelled — payment failed`,
    body: `${order.customerName} (${order.customerEmail}): ${reason}`,
    link: `/admin/orders/${order.id}`,
  });

  if (order.userId) {
    void notifyUser({
      userId: order.userId,
      kind: "order-cancelled",
      title: `Order ${order.reference} could not be processed`,
      body: `${reason}. You can try a different payment method or contact us if you were charged.`,
      link: `/account/orders/${order.id}`,
      email: order.customerEmail,
      emailSubject: `Order ${order.reference} — payment issue`,
    });
  }
}

async function handlePaymentSuccess(intent: Stripe.PaymentIntent): Promise<void> {
  const repo = await getOrderRepository();
  const order = await repo.findByPaymentIntent(intent.id);
  if (!order) return;
  if (order.status !== "processing") return;
  // Sync the card details now that Stripe has them.
  const charge =
    typeof intent.latest_charge === "object" && intent.latest_charge !== null
      ? (intent.latest_charge as Stripe.Charge)
      : null;
  const card = charge?.payment_method_details?.card;
  if (!card) return;
  // Re-issue the same totals (no-op write) to revalidate caches; the card
  // sync itself happens lazily when the customer views the order.
  await repo.updateTotalsByPaymentIntent(intent.id, { totals: order.totals });
}
