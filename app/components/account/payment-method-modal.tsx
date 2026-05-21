"use client";

import { useState } from "react";

import {
  Badge,
  Box,
  Button,
  Heading,
  Icon,
  IconButton,
  Modal,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { useHydrated } from "@/app/lib/state/hydration";
import { usePaymentStore } from "@/app/lib/state/payment-store";
import { AddCardModal } from "./add-card-modal";

interface PaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaymentMethodModal({
  open,
  onClose,
}: PaymentMethodModalProps) {
  const hydrated = useHydrated();
  const cards = usePaymentStore((state) => state.cards);
  const makePrimary = usePaymentStore((state) => state.makePrimary);
  const remove = usePaymentStore((state) => state.remove);

  const [addOpen, setAddOpen] = useState(false);

  const list = hydrated ? cards : [];

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        width="md"
        ariaLabel="Manage payment methods"
      >
        <Box className="px-lg pt-lg pb-md flex items-start justify-between gap-md">
          <Stack gap="xs" className="flex-1 min-w-0">
            <Heading level={2} variant="headline-sm">
              Payment methods
            </Heading>
            <Text variant="body-sm" tone="muted">
              Choose which card we charge by default. Card details are never
              stored on our servers — payments are tokenised by Stripe.
            </Text>
          </Stack>
          <IconButton
            icon="close"
            label="Close"
            size="sm"
            variant="plain"
            onClick={onClose}
          />
        </Box>

        <Box className="flex-1 overflow-y-auto px-lg pb-md">
          <Stack gap="sm">
            {list.length === 0 ? (
              <Box className="rounded-xl border border-dashed border-outline-variant p-lg">
                <Stack gap="sm" align="center">
                  <Icon name="credit_card" className="text-primary text-3xl" />
                  <Text variant="body-md" className="font-semibold">
                    No saved cards yet
                  </Text>
                  <Text variant="body-sm" tone="muted" align="center">
                    Add a card to speed up future checkouts.
                  </Text>
                </Stack>
              </Box>
            ) : (
              list.map((card) => (
                <Box
                  key={card.id}
                  className="rounded-xl border border-outline-variant bg-surface-container-low p-md"
                >
                  <Row gap="md" align="center" wrap>
                    <Box className="w-12 h-8 rounded bg-on-surface flex items-center justify-center shrink-0">
                      <Text
                        as="span"
                        variant="label-caps"
                        tone="inverse"
                      >
                        {card.brand.toUpperCase()}
                      </Text>
                    </Box>
                    <Stack gap="none" className="flex-1 min-w-[160px]">
                      <Text variant="body-md" className="font-semibold">
                        {card.brand} ending in {card.last4}
                      </Text>
                      <Text variant="body-sm" tone="muted">
                        {card.holder} · Expires {card.expiry}
                      </Text>
                    </Stack>
                    {card.isPrimary ? (
                      <Badge tone="primary" size="sm">
                        Primary
                      </Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        caps={false}
                        className="rounded-full"
                        onClick={() => makePrimary(card.id)}
                      >
                        Make primary
                      </Button>
                    )}
                    <IconButton
                      icon="delete"
                      label={`Remove ${card.brand} ending in ${card.last4}`}
                      size="sm"
                      variant="plain"
                      onClick={() => remove(card.id)}
                    />
                  </Row>
                </Box>
              ))
            )}

            <Box className="rounded-xl border border-dashed border-outline-variant p-md">
              <Row gap="md" align="center">
                <Box className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                  <Icon name="add_card" className="text-primary text-xl" />
                </Box>
                <Stack gap="none" className="flex-1 min-w-0">
                  <Text variant="body-md" className="font-semibold">
                    Add a new card
                  </Text>
                  <Text variant="body-sm" tone="muted">
                    Securely add another payment method to your account.
                  </Text>
                </Stack>
                <Button
                  variant="primary"
                  size="sm"
                  caps={false}
                  className="rounded-full"
                  onClick={() => setAddOpen(true)}
                >
                  Add card
                </Button>
              </Row>
            </Box>
          </Stack>
        </Box>

        <Box className="px-lg py-md border-t border-outline-variant bg-surface-container-low">
          <Row gap="sm" justify="end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              caps={false}
              onClick={onClose}
            >
              Done
            </Button>
          </Row>
        </Box>
      </Modal>
      <AddCardModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
