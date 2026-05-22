"use client";

import { useState } from "react";

import {
  Badge,
  Box,
  Button,
  Card,
  Heading,
  IconButton,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import type { AddressRecord } from "@/app/lib/addresses/types";
import { AddressFormModal } from "./address-form-modal";
import { DeleteAddressModal } from "./delete-address-modal";

interface AddressBookSectionProps {
  addresses: AddressRecord[];
}

export function AddressBookSection({ addresses }: AddressBookSectionProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AddressRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AddressRecord | null>(null);

  return (
    <>
      <Stack gap="lg">
        <Row
          justify="between"
          align="end"
          className="pb-sm border-b border-outline-variant"
        >
          <Heading
            level={2}
            variant="headline-md"
            size="headline-sm"
            className="md:text-headline-md"
          >
            Address Book
          </Heading>
          <Button
            variant="ghost"
            size="sm"
            caps={false}
            onClick={() => setAddOpen(true)}
          >
            + Add new
          </Button>
        </Row>
        {addresses.length === 0 ? (
          <EmptyAddresses onAdd={() => setAddOpen(true)} />
        ) : (
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => setEditTarget(address)}
                onDelete={() => setDeleteTarget(address)}
              />
            ))}
          </Box>
        )}
      </Stack>

      <AddressFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        mode="add"
      />
      <AddressFormModal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        mode="edit"
        address={editTarget ?? undefined}
      />
      <DeleteAddressModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        address={deleteTarget}
      />
    </>
  );
}

interface AddressCardProps {
  address: AddressRecord;
  onEdit: () => void;
  onDelete: () => void;
}

function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  const label = address.isDefaultShipping
    ? "Default shipping"
    : address.isDefaultBilling
      ? "Default billing"
      : "Saved address";

  const tone: "primary" | "secondary" | "neutral" = address.isDefaultShipping
    ? "primary"
    : address.isDefaultBilling
      ? "secondary"
      : "neutral";

  return (
    <Card variant="outlined" padding="lg" rounded="2xl">
      <Stack gap="md">
        <Row justify="between" align="center">
          <Badge tone={tone} size="sm">
            {label}
          </Badge>
          <Row gap="xs" align="center">
            <IconButton
              icon="edit"
              label={`Edit ${label}`}
              size="sm"
              variant="plain"
              onClick={onEdit}
            />
            <IconButton
              icon="delete"
              label={`Remove ${label}`}
              size="sm"
              variant="plain"
              onClick={onDelete}
            />
          </Row>
        </Row>
        <Stack gap="xs">
          <Text variant="body-md" className="font-semibold">
            {address.name}
          </Text>
          <Text variant="body-md" tone="muted">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}
          </Text>
          <Text variant="body-md" tone="muted">
            {address.city}, {address.state} {address.postal}
          </Text>
          <Text variant="body-md" tone="muted">
            {address.country}
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
}

function EmptyAddresses({ onAdd }: { onAdd: () => void }) {
  return (
    <Box className="rounded-2xl border border-dashed border-outline-variant p-2xl">
      <Stack gap="sm" align="center" className="text-center">
        <Heading level={3} variant="headline-sm" size="body-lg">
          No saved addresses yet
        </Heading>
        <Box className="max-w-[320px]">
          <Text variant="body-sm" tone="muted">
            Add a shipping or billing address to speed up future checkouts.
          </Text>
        </Box>
        <Button
          variant="primary"
          size="sm"
          caps={false}
          className="rounded-full"
          onClick={onAdd}
        >
          Add an address
        </Button>
      </Stack>
    </Box>
  );
}
