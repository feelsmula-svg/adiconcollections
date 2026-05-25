"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  ChipRail,
  Divider,
  ErrorBanner,
  FormField,
  Heading,
  Modal,
  Row,
  Select,
  Stack,
  Text,
  TextField,
  Textarea,
  type SelectOption,
} from "@/app/components/ui";
import { formatOrderTimestamp } from "@/app/lib/orders/format";
import {
  SHIPPING_CARRIERS,
  SHIPPING_CARRIER_LABELS,
} from "@/app/lib/orders/types";
import type {
  OrderActivityEntry,
  OrderRecord,
  TrackingStep,
  TrackingStepKey,
} from "@/app/lib/orders/types";

interface OrderManagementPanelProps {
  order: OrderRecord;
}

const ADVANCE_LABEL: Record<TrackingStepKey, string> = {
  placed: "Confirm & start processing",
  processing: "Mark as shipped",
  shipped: "Mark out for delivery",
  "out-for-delivery": "Mark as delivered",
  delivered: "Order delivered",
};

const STAGE_TONE: Record<
  TrackingStepKey,
  "primary" | "secondary" | "tertiary" | "neutral"
> = {
  placed: "secondary",
  processing: "secondary",
  shipped: "primary",
  "out-for-delivery": "primary",
  delivered: "tertiary",
};

const CARRIER_OPTIONS: SelectOption[] = [
  { value: "", label: "Select carrier…" },
  ...SHIPPING_CARRIERS.map((value) => ({
    value,
    label: SHIPPING_CARRIER_LABELS[value],
  })),
];

function currentStep(order: OrderRecord): TrackingStep | undefined {
  return (
    order.tracking.find((step) => step.status === "current") ??
    order.tracking.find((step) => step.status === "upcoming") ??
    order.tracking[order.tracking.length - 1]
  );
}

function nextStep(order: OrderRecord): TrackingStep | undefined {
  const idx = order.tracking.findIndex((step) => step.status === "current");
  if (idx === -1) return undefined;
  return order.tracking[idx + 1];
}

function isFullyDelivered(order: OrderRecord): boolean {
  return order.tracking.every((step) => step.status === "complete");
}

interface PostJson {
  success: boolean;
  error?: string;
}

export function OrderManagementPanel({ order }: OrderManagementPanelProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [carrier, setCarrier] = useState<string>(order.carrier ?? "");
  const [trackingNumber, setTrackingNumber] = useState<string>(
    order.trackingNumber ?? "",
  );
  const [notes, setNotes] = useState<string>(order.adminNotes ?? "");
  const [expectedDelivery, setExpectedDelivery] = useState<string>(
    order.expectedDelivery && /^\d{4}-\d{2}-\d{2}$/.test(order.expectedDelivery)
      ? order.expectedDelivery
      : "",
  );
  const [requiresSignature, setRequiresSignature] = useState<boolean>(
    order.requiresSignature,
  );

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const current = useMemo(() => currentStep(order), [order]);
  const next = useMemo(() => nextStep(order), [order]);
  const delivered = useMemo(() => isFullyDelivered(order), [order]);

  const cancelled = order.status === "cancelled";
  const canAdvance = !cancelled && !delivered && Boolean(current);
  const canRevert =
    !cancelled &&
    order.tracking.some((step) => step.status === "complete") &&
    order.tracking[0]?.status === "complete" &&
    order.tracking.some(
      (step, i) => i > 0 && step.status === "complete",
    );

  async function send(
    body: Record<string, unknown>,
    actionId: string,
    onDone?: (next?: PostJson) => void,
  ): Promise<void> {
    setPendingAction(actionId);
    setError(null);
    setSavedMessage(null);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await response.json()) as PostJson;
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Update failed");
      }
      onDone?.(json);
      router.refresh();
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : "Update failed";
      setError(message);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleAdvance() {
    if (current?.key === "processing" && !trackingNumber.trim()) {
      // Soft warning, allow advance — but suggest entering tracking.
    }
    await send({ action: "advance" }, "advance", () =>
      setSavedMessage(
        next ? `Advanced to ${next.label}.` : "Order marked delivered.",
      ),
    );
  }

  async function handleRevert() {
    await send({ action: "revert" }, "revert", () =>
      setSavedMessage("Reverted to previous step."),
    );
  }

  async function handleSaveShipping() {
    await send(
      {
        action: "update-shipping",
        carrier: carrier || undefined,
        trackingNumber: trackingNumber.trim(),
      },
      "shipping",
      () => setSavedMessage("Shipping details saved."),
    );
  }

  async function handleSaveNotes() {
    await send(
      { action: "update-notes", adminNotes: notes },
      "notes",
      () => setSavedMessage("Internal notes saved."),
    );
  }

  async function handleSaveExpectedDelivery() {
    await send(
      {
        action: "update-expected-delivery",
        expectedDelivery: expectedDelivery || "",
      },
      "expected",
      () => setSavedMessage("Expected delivery updated."),
    );
  }

  async function handleSignatureToggle(value: boolean) {
    setRequiresSignature(value);
    await send(
      { action: "update-signature", requiresSignature: value },
      "signature",
      () =>
        setSavedMessage(
          value ? "Signature requirement enabled." : "Signature requirement removed.",
        ),
    );
  }

  async function handleCancel() {
    if (cancelReason.trim().length === 0) {
      setError("Please provide a cancellation reason.");
      return;
    }
    await send(
      { action: "cancel", reason: cancelReason.trim() },
      "cancel",
      () => {
        setCancelOpen(false);
        setCancelReason("");
        setSavedMessage("Order cancelled.");
      },
    );
  }

  async function handleRestore() {
    await send({ action: "restore" }, "restore", () =>
      setSavedMessage("Order restored."),
    );
  }

  const busy = pendingAction !== null;

  return (
    <Stack gap="lg">
      <Card variant="outlined" padding="lg" rounded="2xl">
        <Stack gap="lg">
          <Stack gap="xs">
            <Heading level={2} variant="headline-sm">
              Order progression
            </Heading>
            <Text variant="body-sm" tone="muted">
              Advance the order through each fulfilment stage. The customer sees
              an updated tracking timeline immediately.
            </Text>
          </Stack>

          <StageStepper order={order} />

          {cancelled ? (
            <Card variant="tonal" padding="md" rounded="xl">
              <Stack gap="sm">
                <Row align="center" gap="sm" className="flex-wrap">
                  <Badge tone="error">Cancelled</Badge>
                  <Text variant="body-sm" tone="muted">
                    {order.cancellationReason ?? "No reason recorded"}
                  </Text>
                </Row>
                <RefundSummary order={order} />
                <Row gap="sm" className="flex-wrap">
                  <Button
                    variant="outline"
                    caps={false}
                    onClick={handleRestore}
                    disabled={busy}
                  >
                    {pendingAction === "restore"
                      ? "Restoring…"
                      : "Restore order"}
                  </Button>
                </Row>
              </Stack>
            </Card>
          ) : (
            <Stack gap="md">
              <Row align="center" justify="between" className="flex-wrap gap-sm">
                <Stack gap="none">
                  <Text variant="label-caps" tone="muted" as="span">
                    Current stage
                  </Text>
                  <Row align="center" gap="sm">
                    {current ? (
                      <Badge tone={STAGE_TONE[current.key as TrackingStepKey]}>
                        {current.label}
                      </Badge>
                    ) : null}
                    {next ? (
                      <Text variant="body-sm" tone="muted">
                        → {next.label}
                      </Text>
                    ) : null}
                  </Row>
                </Stack>
                <Row gap="sm" className="flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    caps={false}
                    onClick={handleRevert}
                    disabled={busy || !canRevert}
                  >
                    {pendingAction === "revert" ? "Reverting…" : "← Revert"}
                  </Button>
                  <Button
                    variant="primary"
                    caps={false}
                    onClick={handleAdvance}
                    disabled={busy || !canAdvance}
                  >
                    {pendingAction === "advance"
                      ? "Advancing…"
                      : current
                        ? (ADVANCE_LABEL[current.key as TrackingStepKey] ??
                          "Advance")
                        : "Advance"}
                  </Button>
                </Row>
              </Row>

              {current?.key === "processing" && !order.trackingNumber ? (
                <Card variant="tonal" padding="md" rounded="xl">
                  <Text variant="body-sm" tone="muted">
                    Tip: add a carrier and tracking number below before marking
                    this order as shipped so the customer can track it.
                  </Text>
                </Card>
              ) : null}
            </Stack>
          )}

          <Divider />

          <Row gap="md" className="flex-wrap">
            <Box className="flex-1 min-w-[220px]">
              <FormField label="Expected delivery">
                <Row gap="sm" align="center">
                  <TextField
                    type="date"
                    value={expectedDelivery}
                    onChange={(event) => setExpectedDelivery(event.target.value)}
                    disabled={busy || cancelled}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    caps={false}
                    onClick={handleSaveExpectedDelivery}
                    disabled={busy || cancelled}
                  >
                    {pendingAction === "expected" ? "Saving…" : "Save"}
                  </Button>
                </Row>
              </FormField>
            </Box>
            <Box className="flex-1 min-w-[220px] self-end">
              <Checkbox
                checked={requiresSignature}
                onChange={handleSignatureToggle}
                disabled={busy || cancelled}
                label="Requires signature on delivery"
              />
            </Box>
          </Row>
        </Stack>
      </Card>

      <Card variant="outlined" padding="lg" rounded="2xl">
        <Stack gap="md">
          <Stack gap="xs">
            <Heading level={2} variant="headline-sm">
              Shipping details
            </Heading>
            <Text variant="body-sm" tone="muted">
              Set carrier and tracking number once the parcel is handed off.
            </Text>
          </Stack>

          <Row gap="md" className="flex-wrap">
            <Box className="flex-1 min-w-[200px]">
              <FormField label="Carrier">
                <Select
                  options={CARRIER_OPTIONS}
                  value={carrier}
                  onChange={(event) => setCarrier(event.target.value)}
                  disabled={busy || cancelled}
                />
              </FormField>
            </Box>
            <Box className="flex-[2] min-w-[240px]">
              <FormField label="Tracking number">
                <TextField
                  value={trackingNumber}
                  placeholder="e.g. 1Z999AA10123456784"
                  onChange={(event) => setTrackingNumber(event.target.value)}
                  disabled={busy || cancelled}
                />
              </FormField>
            </Box>
          </Row>

          <Row justify="end">
            <Button
              variant="primary"
              caps={false}
              onClick={handleSaveShipping}
              disabled={busy || cancelled}
            >
              {pendingAction === "shipping" ? "Saving…" : "Save shipping"}
            </Button>
          </Row>
        </Stack>
      </Card>

      <Card variant="outlined" padding="lg" rounded="2xl">
        <Stack gap="md">
          <Stack gap="xs">
            <Heading level={2} variant="headline-sm">
              Internal notes
            </Heading>
            <Text variant="body-sm" tone="muted">
              Only visible to admins. Use it for fulfilment context, customer
              service notes, or hand-off info.
            </Text>
          </Stack>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add internal notes…"
            disabled={busy}
            rows={4}
          />
          <Row justify="end">
            <Button
              variant="outline"
              caps={false}
              onClick={handleSaveNotes}
              disabled={busy}
            >
              {pendingAction === "notes" ? "Saving…" : "Save notes"}
            </Button>
          </Row>
        </Stack>
      </Card>

      {!cancelled ? (
        <Card variant="outlined" padding="lg" rounded="2xl">
          <Stack gap="sm">
            <Heading level={2} variant="headline-sm">
              Cancel order
            </Heading>
            <Text variant="body-sm" tone="muted">
              Cancellation stops fulfilment and flags the order. If the
              customer was charged, we&apos;ll automatically issue a full
              refund of ${order.totals.total.toFixed(2)} to their original
              card.
            </Text>
            <Row justify="end">
              <Button
                variant="ghost"
                caps={false}
                onClick={() => setCancelOpen(true)}
                disabled={busy}
              >
                Cancel this order
              </Button>
            </Row>
          </Stack>
        </Card>
      ) : null}

      <ErrorBanner message={error} />

      {savedMessage ? (
        <Text variant="body-sm" tone="muted">
          {savedMessage}
        </Text>
      ) : null}

      <ActivityFeed entries={order.activity ?? []} />

      <Modal
        open={cancelOpen}
        onClose={() => {
          if (!busy) setCancelOpen(false);
        }}
        ariaLabel="Cancel this order"
      >
        <Stack gap="md" className="p-lg">
          <Heading level={3} variant="headline-sm">
            Cancel this order?
          </Heading>
          <Text variant="body-sm" tone="muted">
            Provide a reason — this will be saved to the order activity log and
            shown internally. A full refund of $
            {order.totals.total.toFixed(2)} will be issued automatically if the
            customer was charged.
          </Text>
          <FormField label="Reason">
            <Textarea
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="e.g. Customer requested cancellation"
              rows={3}
              disabled={busy}
            />
          </FormField>
          <Row gap="sm" justify="end">
            <Button
              variant="ghost"
              caps={false}
              onClick={() => setCancelOpen(false)}
              disabled={busy}
            >
              Keep order
            </Button>
            <Button
              variant="primary"
              caps={false}
              onClick={handleCancel}
              disabled={busy}
            >
              {pendingAction === "cancel" ? "Cancelling…" : "Confirm cancellation"}
            </Button>
          </Row>
        </Stack>
      </Modal>
    </Stack>
  );
}

interface StageStepperProps {
  order: OrderRecord;
}

function StageStepper({ order }: StageStepperProps) {
  const cancelled = order.status === "cancelled";
  return (
    <ChipRail ariaLabel="Order tracking stages" className="gap-xs">
      {order.tracking.map((step, index) => {
        const isLast = index === order.tracking.length - 1;
        const tone = cancelled
          ? "bg-error-container text-on-error-container"
          : step.status === "complete"
            ? "bg-primary text-on-primary"
            : step.status === "current"
              ? "bg-secondary text-on-secondary"
              : "bg-surface-container text-on-surface-variant";
        return (
          <Row key={step.key} align="center" gap="xs">
            <Box
              className={`px-md py-xs rounded-full text-label-md font-semibold whitespace-nowrap ${tone}`}
            >
              {index + 1}. {step.label}
            </Box>
            {!isLast ? (
              <Box className="w-[16px] h-[2px] bg-outline-variant" />
            ) : null}
          </Row>
        );
      })}
    </ChipRail>
  );
}

interface ActivityFeedProps {
  entries: OrderActivityEntry[];
}

function ActivityFeed({ entries }: ActivityFeedProps) {
  if (entries.length === 0) {
    return (
      <Card variant="outlined" padding="lg" rounded="2xl">
        <Stack gap="xs">
          <Heading level={2} variant="headline-sm">
            Activity log
          </Heading>
          <Text variant="body-sm" tone="muted">
            No admin activity recorded yet — actions you take will appear here.
          </Text>
        </Stack>
      </Card>
    );
  }
  const sorted = [...entries].sort((a, b) =>
    a.timestamp < b.timestamp ? 1 : -1,
  );
  return (
    <Card variant="outlined" padding="lg" rounded="2xl">
      <Stack gap="md">
        <Heading level={2} variant="headline-sm">
          Activity log
        </Heading>
        <Stack gap="sm">
          {sorted.map((entry) => (
            <Row key={entry.id} gap="sm" align="start">
              <Box className="mt-[6px] w-[8px] h-[8px] rounded-full shrink-0 bg-primary" />
              <Stack gap="none" className="flex-1">
                <Text variant="body-md" as="span">
                  {entry.message}
                </Text>
                <Text variant="body-sm" tone="muted" as="span">
                  {formatOrderTimestamp(entry.timestamp)} · {entry.actorEmail}
                </Text>
              </Stack>
            </Row>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}

const REFUND_TONE: Record<
  NonNullable<OrderRecord["refund"]>["status"],
  "primary" | "secondary" | "tertiary" | "neutral" | "error"
> = {
  succeeded: "tertiary",
  pending: "secondary",
  failed: "error",
  cancelled: "neutral",
};

const REFUND_LABEL: Record<
  NonNullable<OrderRecord["refund"]>["status"],
  string
> = {
  succeeded: "Refund settled",
  pending: "Refund in progress",
  failed: "Refund failed",
  cancelled: "Payment cancelled",
};

function RefundSummary({ order }: { order: OrderRecord }) {
  const refund = order.refund;
  if (!refund) {
    if (!order.paymentIntentId) return null;
    return (
      <Card variant="outlined" padding="sm" rounded="lg">
        <Row align="center" gap="sm" className="flex-wrap">
          <Badge tone="neutral">Refund pending review</Badge>
          <Text variant="body-sm" tone="muted">
            No refund recorded yet for this cancellation.
          </Text>
        </Row>
      </Card>
    );
  }

  const amount = `$${refund.amount.toFixed(2)}`;
  const helper = refund.paymentCancelled
    ? "Customer was never charged."
    : refund.status === "succeeded"
      ? `${amount} returned to the original card.`
      : refund.status === "pending"
        ? `${amount} on its way back to the original card — most banks settle within 3–10 business days.`
        : refund.status === "failed"
          ? (refund.failureReason ??
            `${amount} refund attempt failed. Issue manually from the Stripe dashboard.`)
          : `${amount} refund was cancelled.`;

  return (
    <Card variant="outlined" padding="sm" rounded="lg">
      <Stack gap="xs">
        <Row align="center" gap="sm" className="flex-wrap">
          <Badge tone={REFUND_TONE[refund.status]}>
            {REFUND_LABEL[refund.status]}
          </Badge>
          {!refund.paymentCancelled ? (
            <Text variant="body-sm" as="span" className="font-medium">
              {amount}
            </Text>
          ) : null}
          {refund.stripeRefundId ? (
            <Text
              variant="body-sm"
              tone="muted"
              as="span"
              className="text-[11px]"
            >
              {refund.stripeRefundId}
            </Text>
          ) : null}
        </Row>
        <Text variant="body-sm" tone="muted">
          {helper}
        </Text>
        {refund.completedAt ? (
          <Text variant="body-sm" tone="muted" as="span" className="text-[11px]">
            {formatOrderTimestamp(refund.completedAt)}
          </Text>
        ) : null}
      </Stack>
    </Card>
  );
}

