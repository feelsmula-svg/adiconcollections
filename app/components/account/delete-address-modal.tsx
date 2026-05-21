"use client";

import { useState } from "react";

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
import {
  useAddressStore,
  type Address,
} from "@/app/lib/state/address-store";

interface DeleteAddressModalProps {
  open: boolean;
  onClose: () => void;
  address: Address | null;
}

export function DeleteAddressModal({
  open,
  onClose,
  address,
}: DeleteAddressModalProps) {
  const removeAddress = useAddressStore((state) => state.remove);
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    if (!address || removing) return;
    setRemoving(true);
    removeAddress(address.id);
    setTimeout(() => {
      setRemoving(false);
      onClose();
    }, 200);
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

        <Row gap="sm" justify="end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            caps={false}
            onClick={onClose}
            disabled={removing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            caps={false}
            onClick={handleRemove}
            disabled={removing}
          >
            {removing ? "Removing…" : "Remove address"}
          </Button>
        </Row>
      </Stack>
    </Modal>
  );
}
