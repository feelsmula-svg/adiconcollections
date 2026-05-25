"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Avatar,
  Box,
  IconButton,
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
    <Box className="rounded-xl border border-outline-variant bg-surface-container-low px-sm py-xs">
      <Row gap="sm" align="center">
        <Avatar
          initials={initials}
          size="sm"
          tone="primary"
          label={`Signed in as ${name}`}
        />
        <Stack gap="none" className="min-w-0 flex-1">
          <Text
            variant="body-sm"
            as="span"
            className="font-semibold truncate leading-tight"
          >
            {name}
          </Text>
          <Text
            variant="body-sm"
            tone="muted"
            as="span"
            className="truncate text-xs leading-tight"
          >
            {email}
          </Text>
        </Stack>
        <IconButton
          icon="logout"
          label={busy ? "Signing out…" : "Sign out"}
          size="sm"
          variant="plain"
          onClick={handleSignOut}
          disabled={busy}
        />
      </Row>
    </Box>
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
