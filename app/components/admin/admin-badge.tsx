"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";

interface AdminBadgeProps {
  name: string;
  email: string;
}

export function AdminBadge({ name, email }: AdminBadgeProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const initials = getInitials(name || email);

  async function handleSignOut() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.replace("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card variant="tonal" padding="lg" rounded="2xl">
      <Row gap="md" align="center" className="mb-md">
        <Avatar
          initials={initials}
          size="md"
          tone="primary"
          label={`Signed in as ${name}`}
        />
        <Stack gap="none" className="min-w-0">
          <Text
            variant="body-md"
            as="span"
            className="font-semibold truncate"
          >
            {name}
          </Text>
          <Text
            variant="body-sm"
            tone="muted"
            as="span"
            className="truncate"
          >
            {email}
          </Text>
        </Stack>
      </Row>
      <Row align="center" gap="sm" className="mb-md">
        <Badge tone="primary">Admin</Badge>
        <Text variant="body-sm" tone="muted" as="span">
          Full access
        </Text>
      </Row>
      <Button
        variant="secondary"
        size="sm"
        fullWidth
        caps={false}
        className="rounded-full"
        onClick={handleSignOut}
        disabled={busy}
      >
        {busy ? "Signing out…" : "Sign out"}
      </Button>
    </Card>
  );
}

function getInitials(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) return "•";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return trimmed.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
