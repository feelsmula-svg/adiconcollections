"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge, Button, Row, Stack, Text } from "@/app/components/ui";
import type { UserRole } from "@/app/lib/auth/types";

interface CustomerRoleToggleProps {
  userId: string;
  currentRole: UserRole;
  selfUserId: string;
}

export function CustomerRoleToggle({
  userId,
  currentRole,
  selfUserId,
}: CustomerRoleToggleProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = userId === selfUserId;
  const target: UserRole = currentRole === "admin" ? "customer" : "admin";

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: target }),
      });
      const json = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Role change failed");
      }
      router.refresh();
    } catch (caught: unknown) {
      const message =
        caught instanceof Error ? caught.message : "Role change failed";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack gap="sm">
      <Row align="center" gap="sm">
        <Text variant="label-caps" tone="muted" as="span">
          Role
        </Text>
        <Badge tone={currentRole === "admin" ? "primary" : "neutral"}>
          {currentRole === "admin" ? "Admin" : "Customer"}
        </Badge>
      </Row>
      {isSelf ? (
        <Text variant="body-sm" tone="muted">
          You cannot change your own role.
        </Text>
      ) : (
        <Button
          variant={target === "admin" ? "primary" : "outline"}
          size="sm"
          caps={false}
          onClick={handleClick}
          disabled={busy}
        >
          {busy
            ? "Updating…"
            : target === "admin"
              ? "Promote to admin"
              : "Demote to customer"}
        </Button>
      )}
      {error ? (
        <Text variant="body-sm" tone="error">
          {error}
        </Text>
      ) : null}
    </Stack>
  );
}
