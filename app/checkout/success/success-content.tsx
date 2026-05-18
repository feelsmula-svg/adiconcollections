"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/app/lib/state/cart-store";
import { useCheckoutStore } from "@/app/lib/state/checkout-store";
import { getStripeClient } from "@/app/lib/stripe/client";
import {
  Box,
  Button,
  Card,
  Container,
  Heading,
  Icon,
  Section,
  Stack,
  Text,
} from "@/app/components/ui";

type Status = "loading" | "succeeded" | "processing" | "failed";

interface Result {
  status: Status;
  message: string;
}

export function CheckoutSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const clear = useCartStore((state) => state.clear);
  const resetCheckout = useCheckoutStore((state) => state.reset);
  const [result, setResult] = useState<Result>({
    status: "loading",
    message: "Confirming your payment with Stripe…",
  });

  useEffect(() => {
    const clientSecret = params.get("payment_intent_client_secret");
    if (!clientSecret) {
      setResult({
        status: "failed",
        message:
          "We could not verify your payment. If you were charged, please contact support.",
      });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const stripe = await getStripeClient();
        if (!stripe) throw new Error("Stripe failed to initialise.");
        const { paymentIntent, error } =
          await stripe.retrievePaymentIntent(clientSecret);
        if (cancelled) return;
        if (error || !paymentIntent) {
          setResult({
            status: "failed",
            message: error?.message ?? "Payment could not be retrieved.",
          });
          return;
        }
        switch (paymentIntent.status) {
          case "succeeded":
            clear();
            resetCheckout();
            setResult({
              status: "succeeded",
              message: "Payment received. We're prepping your order now.",
            });
            return;
          case "processing":
            setResult({
              status: "processing",
              message:
                "Your payment is processing. We'll email you once it clears.",
            });
            return;
          case "requires_payment_method":
            setResult({
              status: "failed",
              message: "Payment was not successful. Please try a different method.",
            });
            return;
          default:
            setResult({
              status: "failed",
              message: `Unexpected status: ${paymentIntent.status}.`,
            });
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to verify payment.";
        setResult({ status: "failed", message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, clear, resetCheckout]);

  const isError = result.status === "failed";
  const isPending = result.status === "loading" || result.status === "processing";

  return (
    <Section padding="lg">
      <Container width="default">
        <Box className="max-w-[520px] mx-auto w-full">
          <Card variant="elevated" padding="xl" rounded="xl">
            <Stack gap="lg" align="center">
              <Box className="w-14 h-14 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center">
                <Icon
                  name={
                    isError
                      ? "error"
                      : isPending
                        ? "schedule"
                        : "check_circle"
                  }
                  filled
                  className={`text-2xl ${isError ? "text-error" : "text-primary"}`}
                />
              </Box>
              <Stack gap="xs" align="center">
                <Heading level={1} variant="headline-md" align="center">
                  {result.status === "succeeded"
                    ? "Order confirmed"
                    : result.status === "processing"
                      ? "Payment processing"
                      : result.status === "loading"
                        ? "One moment…"
                        : "Payment issue"}
                </Heading>
                <Text variant="body-md" tone="muted" align="center">
                  {result.message}
                </Text>
              </Stack>
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push("/")}
              >
                Back to shop
              </Button>
            </Stack>
          </Card>
        </Box>
      </Container>
    </Section>
  );
}
