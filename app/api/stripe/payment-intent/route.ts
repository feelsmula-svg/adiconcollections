import { NextResponse } from "next/server";
import { getStripe } from "@/app/lib/stripe/server";

interface RequestBody {
  amountCents: number;
  paymentIntentId?: string;
}

const MIN_USD_CENTS = 50;

function isValidAmount(value: unknown): value is number {
  return (
    typeof value === "number" && Number.isFinite(value) && value >= MIN_USD_CENTS
  );
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidAmount(body.amountCents)) {
    return NextResponse.json(
      { error: `amountCents must be a number ≥ ${MIN_USD_CENTS}` },
      { status: 400 },
    );
  }

  const amount = Math.round(body.amountCents);

  try {
    const stripe = getStripe();
    if (body.paymentIntentId) {
      const updated = await stripe.paymentIntents.update(body.paymentIntentId, {
        amount,
        currency: "usd",
      });
      return NextResponse.json({
        clientSecret: updated.client_secret,
        paymentIntentId: updated.id,
      });
    }

    const created = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });
    return NextResponse.json({
      clientSecret: created.client_secret,
      paymentIntentId: created.id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Stripe request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
