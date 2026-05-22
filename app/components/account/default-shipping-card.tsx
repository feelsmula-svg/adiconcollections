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
import type { AddressRecord } from "@/app/lib/addresses/types";
import { AddressFormModal } from "./address-form-modal";

interface DefaultShippingCardProps {
  fallbackName: string;
  address: AddressRecord | null;
}

export function DefaultShippingCard({
  fallbackName,
  address,
}: DefaultShippingCardProps) {
  const [editing, setEditing] = useState(false);

  const name = address?.name || fallbackName || "Add a name";
  const line = address
    ? `${address.line1}${address.line2 ? `, ${address.line2}` : ""} · ${address.city}, ${address.state} ${address.postal}`
    : "No default shipping address yet";

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
              {address ? "Edit" : "Add"}
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
        mode={address ? "edit" : "add"}
        address={address ?? undefined}
        forceDefaultShipping={!address}
      />
    </>
  );
}
