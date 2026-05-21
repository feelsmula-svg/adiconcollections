"use client";

import { useState } from "react";

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
import { useAddressStore } from "@/app/lib/state/address-store";
import { useHydrated } from "@/app/lib/state/hydration";
import { AddressFormModal } from "./address-form-modal";

interface DefaultShippingCardProps {
  fallbackName: string;
}

export function DefaultShippingCard({ fallbackName }: DefaultShippingCardProps) {
  const hydrated = useHydrated();
  const addresses = useAddressStore((state) => state.addresses);
  const [editing, setEditing] = useState(false);

  const defaultShipping = hydrated
    ? addresses.find((entry) => entry.isDefaultShipping) ?? null
    : null;

  const name = defaultShipping?.name || fallbackName || "Add a name";
  const line = defaultShipping
    ? `${defaultShipping.line1}${defaultShipping.line2 ? `, ${defaultShipping.line2}` : ""} · ${defaultShipping.city}, ${defaultShipping.state} ${defaultShipping.postal}`
    : "1248 Editorial Way, Suite 400 · New York, NY 10012";

  return (
    <>
      <Card variant="outlined" padding="lg" rounded="2xl">
        <Stack gap="md">
          <Row justify="between" align="center">
            <Row gap="sm" align="center">
              <Box className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center">
                <Icon
                  name="local_shipping"
                  filled
                  className="text-on-secondary-container text-lg"
                />
              </Box>
              <Stack gap="none">
                <Text
                  variant="label-caps"
                  tone="muted"
                  as="span"
                  className="tracking-[0.18em]"
                >
                  Default Shipping
                </Text>
                <Heading level={3} variant="headline-sm" size="body-lg">
                  Home address
                </Heading>
              </Stack>
            </Row>
            <Button
              variant="ghost"
              size="sm"
              caps={false}
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          </Row>
          <Stack gap="xs" className="pl-[52px]">
            <Text variant="body-sm" className="font-semibold">
              {name}
            </Text>
            <Text variant="body-sm" tone="muted">
              {line}
            </Text>
          </Stack>
        </Stack>
      </Card>

      <AddressFormModal
        open={editing}
        onClose={() => setEditing(false)}
        mode={defaultShipping ? "edit" : "add"}
        address={defaultShipping ?? undefined}
      />
    </>
  );
}
