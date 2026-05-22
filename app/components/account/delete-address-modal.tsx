"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Badge,
  Box,
  Button,
  Heading,
  Icon,
  Modal,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { deleteAddress } from "@/app/lib/addresses/actions";
import type { AddressRecord } from "@/app/lib/addresses/types";

interface DeleteAddressModalProps {
  open: boolean;
  onClose: () => void;
  address: AddressRecord | null;
}

export function DeleteAddressModal({
  open,
  onClose,
  address,
}: DeleteAddressModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRemove = () => {
    if (!address || pending) return;
    setErrorMessage(null);
    startTransition(async () => {
      const result = await deleteAddress(address.id);
      if (!result.ok) {
        setErrorMessage(result.error ?? "Could not remove address");
        return;
      }
      router.refresh();
      onClose();
    });
  };

  const label = address?.isDefaultShipping
    ? "Default shipping"
    : address?.isDefaultBilling
      ? "Default billing"
      : "Saved address";

  return (
    <Modal open={open} onClose={onClose} width="sm" ariaLabel="Remove address">
      <Stack gap="lg" className="px-lg py-lg">
        <Stack gap="sm" align="start">
          <Box className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
            <Icon
              name="delete"
              filled
              className="text-on-error-container text-xl"
            />
          </Box>
          <Heading level={2} variant="headline-sm">
            Remove address?
          </Heading>
          <Text variant="body-sm" tone="muted">
            This will permanently remove this address from your account. You
            can always add it again later.
          </Text>
        </Stack>

        {address ? (
          <Box className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
            <Stack gap="xs">
              <Badge tone="neutral" size="sm">
                {label}
              </Badge>
              <Text variant="body-sm" className="font-semibold pt-xs">
                {address.name}
              </Text>
              <Text variant="body-sm" tone="muted">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
              </Text>
              <Text variant="body-sm" tone="muted">
                {address.city}, {address.state} {address.postal}
              </Text>
              <Text variant="body-sm" tone="muted">
                {address.country}
              </Text>
            </Stack>
          </Box>
        ) : null}

        {errorMessage ? (
          <Text variant="body-sm" tone="error">
            {errorMessage}
          </Text>
        ) : null}

        <Row gap="sm" justify="end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            caps={false}
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            caps={false}
            onClick={handleRemove}
            disabled={pending}
          >
            {pending ? "Removing…" : "Remove address"}
          </Button>
        </Row>
      </Stack>
    </Modal>
  );
}
