import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/app/lib/auth/server";
import { getCampaignRepository } from "@/app/lib/campaigns/campaign-repository";
import { quoteCampaignDiscount } from "@/app/lib/campaigns/discount";
import { notifyAdmins, notifyUser } from "@/app/lib/notifications/notify";
import { getOrderRepository } from "@/app/lib/orders/order-repository";
import { formatCurrency } from "@/app/lib/orders/format";
import { findStorefrontProduct } from "@/app/lib/products/storefront";
import { getShippingSettings } from "@/app/lib/settings/shipping/actions";
import { getStripe } from "@/app/lib/stripe/server";

const MIN_USD_CENTS = 50;

// Admin-uploaded product images are stored as base64 `data:` URIs on the
// product record. A typical product photo lands around 200–400 KB once
// encoded, so allow up to ~1 MB to keep payment from being rejected at the
// validation step. (We still recompute price and re-look up the product
// server-side — see `lookupUnitPriceCents` below.)
const MAX_IMAGE_URL_CHARS = 1_048_576;

const itemSchema = z.object({
  id: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(200),
  attributes: z.string().trim().max(400).default(""),
  collection: z.string().trim().max(120).default(""),
  imageUrl: z.string().trim().max(MAX_IMAGE_URL_CHARS).default(""),
  quantity: z.number().int().min(1).max(1000),
  // We accept the client-supplied price but NEVER trust it — we recompute
  // from the product DB below and reject if there's any mismatch.
  price: z.number().int().min(0),
});

const addressSchema = z.object({
  name: z.string().trim().min(1).max(200),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  postal: z.string().trim().min(1).max(40),
  country: z.string().trim().min(1).max(120).default("United States"),
});

const totalsSchema = z.object({
  subtotal: z.number().int().min(0),
  shipping: z.number().int().min(0),
  tax: z.number().int().min(0),
  total: z.number().int().min(MIN_USD_CENTS),
});

const cartSchema = z.object({
  customerName: z.string().trim().min(1).max(200),
  customerEmail: z.string().trim().toLowerCase().min(1).email(),
  items: z.array(itemSchema).min(1).max(100),
  shippingAddress: addressSchema,
  totals: totalsSchema,
  deliveryMethod: z.enum(["same-day", "standard"]),
  promoCode: z.string().trim().toUpperCase().max(40).optional(),
});

const bodySchema = z.object({
  amountCents: z.number().int().min(MIN_USD_CENTS),
  paymentIntentId: z.string().trim().max(120).optional(),
  cart: cartSchema,
});

type CartPayload = z.infer<typeof cartSchema>;

function parseVariantId(id: string): {
  baseId: string;
  lengthDigits: string | null;
} {
  const match = id.match(/^(.+?)--(\d+)$/);
  if (match) return { baseId: match[1], lengthDigits: match[2] };
  return { baseId: id, lengthDigits: null };
}

async function lookupUnitPriceCents(
  itemId: string,
): Promise<number | null> {
  const { baseId, lengthDigits } = parseVariantId(itemId);
  const product = await findStorefrontProduct(baseId);
  if (!product) return null;
  if (lengthDigits && product.lengthOptions) {
    const match = product.lengthOptions.find(
      (opt) => opt.length.replace(/\D+/g, "") === lengthDigits,
    );
    if (match) return match.priceCents;
  }
  return product.priceCents;
}

interface RecomputedTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

interface RecomputeFailure {
  ok: false;
  error: string;
}

interface RecomputeSuccess {
  ok: true;
  totals: RecomputedTotals;
}

async function recomputeTotalsForCart(
  cart: CartPayload,
): Promise<RecomputeSuccess | RecomputeFailure> {
  let subtotal = 0;
  for (const item of cart.items) {
    const unit = await lookupUnitPriceCents(item.id);
    if (unit === null) {
      return {
        ok: false,
        error: `Product "${item.id}" is no longer available. Please refresh and retry.`,
      };
    }
    subtotal += unit * item.quantity;
  }
  const shippingSettings = await getShippingSettings();
  const shipping =
    cart.deliveryMethod === "same-day"
      ? shippingSettings.sameDay.priceCents
      : shippingSettings.standard.priceCents;

  // Apply server-side promo discount if a valid code was supplied.
  let subtotalDiscount = 0;
  let shippingDiscount = 0;
  if (cart.promoCode) {
    const repo = await getCampaignRepository();
    const campaign = await repo.findByPromoCode(cart.promoCode);
    if (!campaign || !campaign.discount) {
      return {
        ok: false,
        error: "Promo code is no longer valid. Remove it and try again.",
      };
    }
    const quote = quoteCampaignDiscount(campaign, subtotal, shipping);
    subtotalDiscount = quote.subtotalDiscountCents;
    shippingDiscount = quote.shippingDiscountCents;
  }

  const discountedSubtotal = Math.max(0, subtotal - subtotalDiscount);
  const discountedShipping = Math.max(0, shipping - shippingDiscount);
  const tax = Math.round(discountedSubtotal * shippingSettings.taxRate);
  const total = discountedSubtotal + discountedShipping + tax;
  return {
    ok: true,
    totals: {
      subtotal: discountedSubtotal,
      shipping: discountedShipping,
      tax,
      total,
    },
  };
}

export async function POST(request: Request) {
  // Auth is required for every path on this route — there is no legitimate
  // anonymous use case for creating or updating PaymentIntents.
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { error: "Sign in to complete checkout" },
      { status: 401 },
    );
  }

  let body: z.infer<typeof bodySchema>;
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      const summary =
        issues.length > 0
          ? `Invalid request body — ${issues
              .map((i) => `${i.path || "(root)"}: ${i.message}`)
              .join("; ")}`
          : "Invalid request body";
      return NextResponse.json(
        { error: summary, issues },
        { status: 400 },
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Always recompute totals from authoritative server-side data.
  const recomputed = await recomputeTotalsForCart(body.cart);
  if (!recomputed.ok) {
    return NextResponse.json({ error: recomputed.error }, { status: 400 });
  }
  const serverTotals = recomputed.totals;

  if (serverTotals.total < MIN_USD_CENTS) {
    return NextResponse.json(
      { error: "Order total is below the minimum charge" },
      { status: 400 },
    );
  }

  if (body.amountCents !== serverTotals.total) {
    return NextResponse.json(
      {
        error:
          "Cart total has changed. Please refresh your cart and try again.",
      },
      { status: 409 },
    );
  }

  const stripe = getStripe();
  const repo = await getOrderRepository();

  try {
    // Update path: resize the existing PaymentIntent + sync order totals.
    // Caller must own the order tied to that PaymentIntent.
    if (body.paymentIntentId) {
      const existingOrder = await repo.findByPaymentIntent(body.paymentIntentId);
      if (!existingOrder) {
        return NextResponse.json(
          { error: "Payment intent not found" },
          { status: 404 },
        );
      }
      if (existingOrder.userId !== session.id) {
        return NextResponse.json(
          { error: "Payment intent not found" },
          { status: 404 },
        );
      }
      const updated = await stripe.paymentIntents.update(body.paymentIntentId, {
        amount: serverTotals.total,
        currency: "usd",
      });
      await repo.updateTotalsByPaymentIntent(body.paymentIntentId, {
        totals: serverTotals,
      });
      return NextResponse.json({
        clientSecret: updated.client_secret,
        paymentIntentId: updated.id,
      });
    }

    // First-time create.
    const intent = await stripe.paymentIntents.create({
      amount: serverTotals.total,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: body.cart.customerEmail,
      metadata: {
        userId: session.id,
        customerEmail: body.cart.customerEmail,
      },
    });

    const createdOrder = await repo.create({
      paymentIntentId: intent.id,
      userId: session.id,
      customerName: body.cart.customerName,
      customerEmail: body.cart.customerEmail,
      items: await Promise.all(
        body.cart.items.map(async (item) => {
          const unitPrice = await lookupUnitPriceCents(item.id);
          return {
            id: item.id,
            name: item.name,
            attributes: item.attributes,
            collection: item.collection,
            imageUrl: item.imageUrl,
            quantity: item.quantity,
            // Use the server-recomputed price, not whatever the client sent.
            price: unitPrice ?? 0,
          };
        }),
      ),
      shippingAddress: {
        name: body.cart.shippingAddress.name,
        line1: body.cart.shippingAddress.line1,
        line2: body.cart.shippingAddress.line2 || undefined,
        city: body.cart.shippingAddress.city,
        state: body.cart.shippingAddress.state,
        postal: body.cart.shippingAddress.postal,
        country: body.cart.shippingAddress.country,
      },
      payment: {
        brand: "Card",
        last4: "••••",
        expiry: "",
      },
      totals: serverTotals,
      deliveryMethod: body.cart.deliveryMethod,
    });

    // Best-effort admin notification — never blocks the response.
    void notifyAdmins({
      kind: "order-placed",
      title: `New order ${createdOrder.reference} · ${formatCurrency(createdOrder.totals.total)}`,
      body: `${body.cart.customerName} (${body.cart.customerEmail}) just placed an order with ${body.cart.items.length} item${body.cart.items.length === 1 ? "" : "s"}.`,
      link: `/admin/orders/${createdOrder.id}`,
    });

    // Confirmation notification for the customer themselves.
    void notifyUser({
      userId: session.id,
      kind: "order-placed",
      title: `Order ${createdOrder.reference} confirmed`,
      body: `Thanks ${body.cart.customerName.split(" ")[0] ?? body.cart.customerName} — we've received your order for ${formatCurrency(createdOrder.totals.total)} and we'll let you know as soon as it ships.`,
      link: `/account/orders/${createdOrder.id}`,
      email: body.cart.customerEmail,
      emailSubject: `Your AdiCon order ${createdOrder.reference} is confirmed`,
    });

    return NextResponse.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Stripe request failed";
    console.error("[stripe/payment-intent] error:", message);
    return NextResponse.json(
      { error: "Could not process payment. Please try again." },
      { status: 500 },
    );
  }
}
