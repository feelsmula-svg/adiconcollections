"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
import {
  approveAdminRequest,
  rejectAdminRequest,
} from "@/app/lib/admin/admin-management-actions";
import type { PublicUser } from "@/app/lib/auth/types";

interface PendingAdminsPanelProps {
  pending: PublicUser[];
}

export function PendingAdminsPanel({ pending }: PendingAdminsPanelProps) {
  const router = useRouter();
  const [pendingTransition, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handle = (
    user: PublicUser,
    action: "approve" | "reject",
  ) => {
    if (pendingTransition) return;
    setBusyId(user.id);
    setErrorMessage(null);
    setFeedback(null);
    startTransition(async () => {
      const result =
        action === "approve"
          ? await approveAdminRequest(user.id)
          : await rejectAdminRequest(user.id);
      setBusyId(null);
      if (!result.ok) {
        setErrorMessage(result.error ?? "Could not update admin request");
        return;
      }
      setFeedback(
        action === "approve"
          ? `${user.name || user.email} is now an active admin.`
          : `${user.name || user.email}'s admin request was rejected.`,
      );
      router.refresh();
    });
  };

  return (
    <Card variant="outlined" padding="lg" rounded="2xl">
      <Stack gap="lg">
        <Row align="center" gap="sm">
          <Box className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
            <Icon
              name="how_to_reg"
              filled
              className="text-on-tertiary-container"
            />
          </Box>
          <Stack gap="none" className="flex-1">
            <Heading level={2} variant="headline-sm">
              Pending admin requests
            </Heading>
            <Text variant="body-sm" tone="muted">
              New admin signups land here. They can&apos;t sign in until an
              existing admin approves them.
            </Text>
          </Stack>
          <Badge tone={pending.length > 0 ? "secondary" : "neutral"} size="sm">
            {pending.length}
          </Badge>
        </Row>

        {errorMessage ? (
          <Text variant="body-sm" tone="error">
            {errorMessage}
          </Text>
        ) : null}
        {feedback ? (
          <Text variant="body-sm" tone="primary">
            {feedback}
          </Text>
        ) : null}

        {pending.length === 0 ? (
          <Box className="rounded-xl border border-dashed border-outline-variant p-lg">
            <Stack gap="sm" align="center" className="text-center">
              <Icon name="inbox" className="text-on-surface-variant text-2xl" />
              <Text variant="body-sm" tone="muted">
                No pending admin requests right now.
              </Text>
            </Stack>
          </Box>
        ) : (
          <Stack gap="sm">
            {pending.map((user) => {
              const busy = busyId === user.id && pendingTransition;
              return (
                <Box
                  key={user.id}
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md"
                >
                  <Row gap="md" align="center" justify="between" wrap>
                    <Stack gap="none" className="min-w-0 flex-1">
                      <Text
                        variant="body-md"
                        as="span"
                        className="font-semibold truncate"
                      >
                        {user.name || user.email}
                      </Text>
                      <Text
                        variant="body-sm"
                        tone="muted"
                        as="span"
                        className="truncate"
                      >
                        {user.email}
                      </Text>
                    </Stack>
                    <Row gap="xs" align="center">
                      <Button
                        variant="ghost"
                        size="sm"
                        caps={false}
                        onClick={() => handle(user, "reject")}
                        disabled={busy}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        caps={false}
                        className="rounded-full"
                        onClick={() => handle(user, "approve")}
                        disabled={busy}
                      >
                        {busy ? "Updating…" : "Approve"}
                      </Button>
                    </Row>
                  </Row>
                </Box>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
