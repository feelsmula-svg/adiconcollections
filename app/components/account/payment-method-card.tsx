"use client";

import { useState } from "react";

import {
  Badge,
  Box,
  Button,
  Card,
  Heading,
  Icon,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { useHydrated } from "@/app/lib/state/hydration";
import { usePaymentStore } from "@/app/lib/state/payment-store";
import { PaymentMethodModal } from "./payment-method-modal";

export function PaymentMethodCard() {
  const hydrated = useHydrated();
  const cards = usePaymentStore((state) => state.cards);
  const [open, setOpen] = useState(false);

  const primary =
    hydrated && cards.length > 0
      ? cards.find((card) => card.isPrimary) ?? cards[0]
      : null;

  const heading = primary
    ? `${primary.brand} · ${primary.last4}`
    : "No card on file";
  const detail = primary
    ? `Expires ${primary.expiry}`
    : "Add one to speed up checkout";

  return (
    <>
      <Card variant="outlined" padding="lg" rounded="2xl">
        <Stack gap="md">
          <Row justify="between" align="center">
            <Row gap="sm" align="center">
              <Box className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center">
                <Icon
                  name="credit_card"
                  filled
                  className="text-on-primary-container text-lg"
                />
              </Box>
              <Stack gap="none">
                <Text
                  variant="label-caps"
                  tone="muted"
                  as="span"
                  className="tracking-[0.18em]"
                >
                  Payment Method
                </Text>
                <Heading level={3} variant="headline-sm" size="body-lg">
                  {heading}
                </Heading>
              </Stack>
            </Row>
            <Button
              variant="ghost"
              size="sm"
              caps={false}
              onClick={() => setOpen(true)}
            >
              Manage
            </Button>
          </Row>
          <Row align="center" gap="sm" className="pl-[52px]">
            {primary ? (
              <>
                <Badge tone="neutral" size="sm">
                  Primary
                </Badge>
                <Text variant="body-sm" tone="muted">
                  {detail}
                </Text>
              </>
            ) : (
              <Text variant="body-sm" tone="muted">
                {detail}
              </Text>
            )}
          </Row>
        </Stack>
      </Card>

      <PaymentMethodModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
