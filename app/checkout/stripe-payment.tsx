"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { formatPrice } from "@/app/lib/cart/format";
import { getStripeClient } from "@/app/lib/stripe/client";
import {
  Box,
  Button,
  Card,
  Heading,
  Icon,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";

interface CartPayloadItem {
  id: string;
  name: string;
  attributes: string;
  collection: string;
  imageUrl: string;
  quantity: number;
  price: number;
}

interface CartPayloadAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal: string;
  country: string;
}

interface CartPayloadTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface CheckoutCartPayload {
  customerName: string;
  customerEmail: string;
  items: CartPayloadItem[];
  shippingAddress: CartPayloadAddress;
  totals: CartPayloadTotals;
  deliveryMethod: "same-day" | "standard";
  promoCode?: string;
}

interface StripePaymentProps {
  amountCents: number;
  disabled?: boolean;
  getCartPayload: () => CheckoutCartPayload;
}

/**
 * Defensive pre-flight check: surface the most common cart payload problems
 * (empty cart, missing shipping fields, bad totals) BEFORE the request so the
 * user sees a meaningful message instead of a server-side "Invalid request
 * body".
 */
function validateCartPayload(cart: CheckoutCartPayload): string | null {
  if (cart.items.length === 0) {
    return "Your cart is empty.";
  }
  for (const item of cart.items) {
    if (!item.id || !item.name) return "A cart item is missing required info.";
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return `Invalid quantity for "${item.name}".`;
    }
    if (!Number.isInteger(item.price) || item.price < 0) {
      return `Invalid price for "${item.name}".`;
    }
  }
  if (!cart.customerName.trim()) return "Please enter your full name.";
  if (!cart.customerEmail.trim()) return "Please enter your email.";
  const a = cart.shippingAddress;
  if (!a.name.trim()) return "Please enter your shipping name.";
  if (!a.line1.trim()) return "Please enter your street address.";
  if (!a.city.trim()) return "Please enter your city.";
  if (!a.state.trim()) return "Please enter your state.";
  if (!a.postal.trim()) return "Please enter your ZIP / postal code.";
  if (cart.totals.total < 50) {
    return "Order total is below the minimum charge ($0.50).";
  }
  return null;
}

export function StripePayment({
  amountCents,
  disabled,
  getCartPayload,
}: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);
  const intentIdRef = useRef<string | null>(null);
  const getCartPayloadRef = useRef(getCartPayload);
  useEffect(() => {
    getCartPayloadRef.current = getCartPayload;
  }, [getCartPayload]);

  useEffect(() => {
    if (disabled) return;
    if (amountCents < 50) {
      setIntentError("Total is below Stripe's minimum charge ($0.50).");
      return;
    }
    let cancelled = false;
    setIntentError(null);

    (async () => {
      try {
        const cart = getCartPayloadRef.current();
        const preCheckError = validateCartPayload(cart);
        if (preCheckError) {
          throw new Error(preCheckError);
        }
        const response = await fetch("/api/stripe/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountCents,
            paymentIntentId: intentIdRef.current ?? undefined,
            cart,
          }),
        });
        if (cancelled) return;

        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          const text = await response.text();
          const looksLikeMissingKey =
            text.includes("STRIPE_SECRET_KEY") ||
            text.includes("publishable") ||
            response.status === 500;
          throw new Error(
            looksLikeMissingKey
              ? "Stripe keys are not configured. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local and restart the dev server."
              : `Payment service returned ${response.status} ${response.statusText}.`,
          );
        }

        const data = (await response.json()) as {
          clientSecret?: string;
          paymentIntentId?: string;
          error?: string;
          issues?: Array<{ path: string; message: string }>;
        };
        if (!response.ok || !data.clientSecret) {
          const issueDetail = data.issues
            ?.map((issue) => `${issue.path || "(root)"}: ${issue.message}`)
            .join("\n");
          const message = issueDetail
            ? `${data.error ?? "Could not create payment intent."}\n${issueDetail}`
            : data.error ?? "Could not create payment intent.";
          throw new Error(message);
        }
        intentIdRef.current = data.paymentIntentId ?? null;
        setClientSecret(data.clientSecret);
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Could not create payment intent.";
        setIntentError(message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [amountCents, disabled]);

  return (
    <Card variant="elevated" padding="lg">
      <Stack gap="md">
        <Row justify="between" align="center" wrap gap="sm">
          <Heading level={2} variant="headline-sm" tone="primary">
            Payment
          </Heading>
          <Row gap="xs" align="center">
            <Icon name="lock" className="text-base text-on-surface-variant" />
            <Text variant="label-caps" tone="muted" className="text-[10px]">
              Secured by Stripe
            </Text>
          </Row>
        </Row>

        {disabled && (
          <Box className="bg-surface-container text-on-surface-variant rounded-lg p-md">
            <Text variant="body-sm">
              Complete the shipping information above to enable payment.
            </Text>
          </Box>
        )}

        {!disabled && intentError && (
          <Box className="bg-error-container text-on-error-container rounded-lg p-md">
            <Text variant="body-sm" className="whitespace-pre-wrap">
              {intentError}
            </Text>
          </Box>
        )}

        {!disabled && !intentError && !clientSecret && <PaymentSkeleton />}

        {!disabled && clientSecret && (
          <StripeElementsWrapper
            clientSecret={clientSecret}
            amountCents={amountCents}
          />
        )}
      </Stack>
    </Card>
  );
}

interface StripeElementsWrapperProps {
  clientSecret: string;
  amountCents: number;
}

function StripeElementsWrapper({
  clientSecret,
  amountCents,
}: StripeElementsWrapperProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#6c2f00",
        colorBackground: "#fff8f5",
        colorText: "#201a18",
        colorDanger: "#ba1a1a",
        fontFamily: "Inter, system-ui, sans-serif",
        borderRadius: "8px",
      },
    },
  };

  return (
    <Elements stripe={getStripeClient()} options={options}>
      <PaymentForm amountCents={amountCents} />
    </Elements>
  );
}

interface PaymentFormProps {
  amountCents: number;
}

function PaymentForm({ amountCents }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const returnUrl = `${window.location.origin}/checkout/success`;

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment could not be confirmed.");
      setSubmitting(false);
    }
  }, [stripe, elements]);

  return (
    <Stack gap="md">
      <PaymentElement options={{ layout: "tabs" }} />

      {error && (
        <Box className="bg-error-container text-on-error-container rounded-lg p-md">
          <Text variant="body-sm">{error}</Text>
        </Box>
      )}

      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={!stripe || !elements || submitting}
        onClick={onSubmit}
        className="tracking-[0.12em] shadow-md active:scale-[0.98]"
      >
        {submitting ? "Processing payment…" : `Pay ${formatPrice(amountCents)}`}
      </Button>
    </Stack>
  );
}

function PaymentSkeleton() {
  return (
    <Stack gap="sm">
      <Box className="h-10 rounded-md bg-surface-container animate-pulse" />
      <Box className="h-10 rounded-md bg-surface-container animate-pulse" />
      <Box className="h-12 rounded-md bg-surface-container animate-pulse" />
    </Stack>
  );
}
