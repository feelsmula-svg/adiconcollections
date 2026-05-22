"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useCartStore } from "@/app/lib/state/cart-store";
import { useCheckoutStore } from "@/app/lib/state/checkout-store";
import { confirmCheckoutByPaymentIntent } from "@/app/lib/checkout/actions";
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
  orderId?: string;
}

export function CheckoutSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const clear = useCartStore((state) => state.clear);
  const resetCheckout = useCheckoutStore((state) => state.reset);
  const [result, setResult] = useState<Result>({
    status: "loading",
    message: "Confirming your order…",
  });
  const ranRef = useRef<string | null>(null);

  useEffect(() => {
    const paymentIntentId =
      params.get("payment_intent") ?? readIntentFromClientSecret(params);
    if (!paymentIntentId) {
      setResult({
        status: "failed",
        message:
          "We could not verify your payment. If you were charged, please contact support.",
      });
      return;
    }

    if (ranRef.current === paymentIntentId) return;
    ranRef.current = paymentIntentId;

    let cancelled = false;
    (async () => {
      const outcome = await confirmCheckoutByPaymentIntent(paymentIntentId);
      if (cancelled) return;

      if (!outcome.ok) {
        setResult({
          status: outcome.status === "processing" ? "processing" : "failed",
          message:
            outcome.error ?? "We couldn't confirm your order. Please contact support.",
        });
        return;
      }

      if (outcome.status === "processing") {
        setResult({
          status: "processing",
          message:
            "Your payment is processing. We'll email you once it clears.",
          orderId: outcome.order?.id,
        });
        return;
      }

      if (outcome.status === "failed") {
        setResult({
          status: "failed",
          message: "Payment was not successful. Please try a different method.",
          orderId: outcome.order?.id,
        });
        return;
      }

      clear();
      resetCheckout();
      setResult({
        status: "succeeded",
        message: "Payment received. We're prepping your order now.",
        orderId: outcome.order?.id,
      });
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
              <Stack gap="sm" align="center" className="w-full">
                {result.orderId ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() =>
                      router.push(`/account/orders/${result.orderId}`)
                    }
                  >
                    View order
                  </Button>
                ) : null}
                {result.status === "succeeded" ? (
                  <Button
                    variant="ghost"
                    size="md"
                    caps={false}
                    onClick={() => router.push("/account/orders")}
                  >
                    All my orders
                  </Button>
                ) : null}
                <Button
                  variant={result.status === "succeeded" ? "outline" : "primary"}
                  size="md"
                  onClick={() => router.push("/")}
                >
                  Back to shop
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Box>
      </Container>
    </Section>
  );
}

interface ParamsLike {
  get(key: string): string | null;
}

function readIntentFromClientSecret(params: ParamsLike): string | null {
  const cs = params.get("payment_intent_client_secret");
  if (!cs) return null;
  const match = cs.match(/^(pi_[A-Za-z0-9]+)_secret_/);
  return match ? match[1] : null;
}
