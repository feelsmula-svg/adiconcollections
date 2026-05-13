"use client";

import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripeClient(): Promise<Stripe | null> {
  if (stripePromise) return stripePromise;
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    return Promise.reject(
      new Error(
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Add it to .env.local (see .env.example).",
      ),
    );
  }
  stripePromise = loadStripe(key);
  return stripePromise;
}
