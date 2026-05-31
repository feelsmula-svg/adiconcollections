import "server-only";

// DEV ONLY — single-process JSON file store. Replace with a real database adapter
// by implementing OrderRepository and swapping the factory.

import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

import {
  DELIVERY_METHOD_DAYS,
  TRACKING_STEP_KEYS,
  TRACKING_STEP_LABELS,
  TRACKING_STEP_TO_STATUS,
} from "../types";
import { formatCarrier } from "../format";
import type {
  ListOrdersFilters,
  OrderActivityEntry,
  OrderRecord,
  OrderRefund,
  OrderStatus,
  TrackingStep,
  TrackingStepKey,
  TrackingStepStatus,
} from "../types";
import type {
  AdvanceStageInput,
  CancelOrderInput,
  CreateOrderInput,
  OrderRepository,
  RecordRefundInput,
  RestoreOrderInput,
  UpdateExpectedDeliveryInput,
  UpdateNotesInput,
  UpdateShippingInput,
  UpdateSignatureInput,
  UpdateTrackingInput,
} from "../order-repository";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "orders.json");

interface FileShape {
  orders: OrderRecord[];
}

function nowIso(): string {
  return new Date().toISOString().slice(0, 19);
}

function appendActivity(
  existing: OrderActivityEntry[] | undefined,
  entry: Omit<OrderActivityEntry, "id" | "timestamp"> & { timestamp?: string },
): OrderActivityEntry[] {
  const next: OrderActivityEntry = {
    id: randomUUID(),
    timestamp: entry.timestamp ?? nowIso(),
    actorEmail: entry.actorEmail,
    kind: entry.kind,
    message: entry.message,
  };
  return [...(existing ?? []), next];
}

function currentStepIndex(tracking: readonly TrackingStep[]): number {
  const current = tracking.findIndex((step) => step.status === "current");
  if (current !== -1) return current;
  // No explicit current — pick the first upcoming step, or the last step if all complete.
  const upcoming = tracking.findIndex((step) => step.status === "upcoming");
  if (upcoming !== -1) return upcoming;
  return tracking.length - 1;
}

function lastCompleteIndex(tracking: readonly TrackingStep[]): number {
  for (let i = tracking.length - 1; i >= 0; i -= 1) {
    if (tracking[i].status === "complete") return i;
  }
  return -1;
}

function ensureCanonicalTracking(
  tracking: readonly TrackingStep[],
): TrackingStep[] {
  // Make sure every canonical step is present, in canonical order.
  const byKey = new Map<TrackingStepKey, TrackingStep>();
  for (const step of tracking) {
    byKey.set(step.key as TrackingStepKey, step);
  }
  return TRACKING_STEP_KEYS.map((key) => {
    const existing = byKey.get(key);
    if (existing) return existing;
    return {
      key,
      label: TRACKING_STEP_LABELS[key],
      status: "upcoming" as TrackingStepStatus,
    };
  });
}

function setStep(
  tracking: readonly TrackingStep[],
  index: number,
  patch: Partial<TrackingStep>,
): TrackingStep[] {
  return tracking.map((step, i) => (i === index ? { ...step, ...patch } : step));
}

function deriveOrderStatus(tracking: readonly TrackingStep[]): OrderStatus {
  // The "current" step drives the overall status; if everything is complete, use the last step.
  const focus = currentStepIndex(tracking);
  const key = tracking[focus]?.key as TrackingStepKey | undefined;
  if (!key) return "processing";
  return TRACKING_STEP_TO_STATUS[key];
}

function formatRefundAmount(refund: OrderRefund): string {
  return `$${refund.amount.toFixed(2)}`;
}

function defaultRefundActivityMessage(refund: OrderRefund): string {
  if (refund.paymentCancelled) {
    return "Cancelled the pending payment — customer was not charged.";
  }
  switch (refund.status) {
    case "succeeded":
      return `Refund of ${formatRefundAmount(refund)} completed.`;
    case "pending":
      return `Refund of ${formatRefundAmount(refund)} initiated. Should settle in 3–10 business days.`;
    case "failed":
      return `Refund of ${formatRefundAmount(refund)} failed${refund.failureReason ? `: ${refund.failureReason}` : ""}.`;
    case "cancelled":
      return `Refund of ${formatRefundAmount(refund)} was cancelled.`;
  }
}

function refundActivityKind(
  next: OrderRefund,
  prev: OrderRefund | undefined,
): OrderActivityEntry["kind"] {
  if (next.status === "failed") return "refund-failed";
  if (prev && prev.status !== next.status) return "refund-updated";
  return "refund-issued";
}

export class JsonOrderRepository implements OrderRepository {
  private mutex: Promise<void> = Promise.resolve();

  async list(filters: ListOrdersFilters = {}): Promise<OrderRecord[]> {
    return this.withLock(async () => {
      const { orders } = await readFile();
      const q = filters.q?.trim().toLowerCase();
      return orders
        .filter((order) => {
          if (filters.userId && order.userId !== filters.userId) return false;
          if (filters.status && order.status !== filters.status) return false;
          if (q) {
            const haystack =
              `${order.reference} ${order.customerEmail} ${order.customerName} ${order.productName}`.toLowerCase();
            if (!haystack.includes(q)) return false;
          }
          return true;
        })
        .sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1));
    });
  }

  async findById(id: string): Promise<OrderRecord | null> {
    return this.withLock(async () => {
      const { orders } = await readFile();
      return orders.find((order) => order.id === id) ?? null;
    });
  }

  async findActiveForUser(userId: string): Promise<OrderRecord | null> {
    return this.withLock(async () => {
      const { orders } = await readFile();
      const active = orders
        .filter(
          (order) =>
            order.userId === userId &&
            (order.status === "in-transit" || order.status === "processing"),
        )
        .sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1));
      return active[0] ?? null;
    });
  }

  async findByPaymentIntent(
    paymentIntentId: string,
  ): Promise<OrderRecord | null> {
    return this.withLock(async () => {
      const { orders } = await readFile();
      return (
        orders.find((order) => order.paymentIntentId === paymentIntentId) ??
        null
      );
    });
  }

  async updateTotalsByPaymentIntent(
    paymentIntentId: string,
    input: { totals: OrderRecord["totals"] },
  ): Promise<OrderRecord | null> {
    return this.withLock(async () => {
      const data = await readFile();
      const index = data.orders.findIndex(
        (order) => order.paymentIntentId === paymentIntentId,
      );
      if (index === -1) return null;
      const next: OrderRecord = {
        ...data.orders[index],
        totals: input.totals,
        total: input.totals.total,
      };
      data.orders[index] = next;
      await writeFile(data);
      return next;
    });
  }

  async markPaidByPaymentIntent(
    paymentIntentId: string,
  ): Promise<OrderRecord | null> {
    return this.withLock(async () => {
      const data = await readFile();
      const index = data.orders.findIndex(
        (order) => order.paymentIntentId === paymentIntentId,
      );
      if (index === -1) return null;
      if (data.orders[index].paymentStatus === "paid") {
        return data.orders[index];
      }
      const next: OrderRecord = {
        ...data.orders[index],
        paymentStatus: "paid",
      };
      data.orders[index] = next;
      await writeFile(data);
      return next;
    });
  }

  async create(input: CreateOrderInput): Promise<OrderRecord> {
    return this.withLock(async () => {
      const data = await readFile();
      const existing = data.orders.find(
        (order) => order.paymentIntentId === input.paymentIntentId,
      );
      if (existing) return existing;

      const placedAt = nowIso();
      const tracking: TrackingStep[] = TRACKING_STEP_KEYS.map((key, index) => {
        if (index === 0) {
          return {
            key,
            label: TRACKING_STEP_LABELS[key],
            status: "complete" as TrackingStepStatus,
            timestamp: placedAt,
          };
        }
        if (index === 1) {
          return {
            key,
            label: TRACKING_STEP_LABELS[key],
            status: "current" as TrackingStepStatus,
            timestamp: placedAt,
          };
        }
        return {
          key,
          label: TRACKING_STEP_LABELS[key],
          status: "upcoming" as TrackingStepStatus,
        };
      });

      const productName =
        input.items.length === 0
          ? "Order"
          : input.items.length === 1
            ? input.items[0].name
            : `${input.items[0].name} + ${input.items.length - 1} more`;

      const reference = `#AC-${Math.floor(10000 + Math.random() * 89999)}`;

      const expectedDate = new Date(placedAt);
      expectedDate.setDate(
        expectedDate.getDate() + DELIVERY_METHOD_DAYS[input.deliveryMethod],
      );
      const expectedDelivery = expectedDate.toISOString().slice(0, 10);

      const record: OrderRecord = {
        id: randomUUID(),
        reference,
        placedAt,
        status: "processing",
        total: input.totals.total,
        productName,
        imageUrl: input.items[0]?.imageUrl,
        expectedDelivery,
        userId: input.userId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        items: input.items,
        shippingAddress: input.shippingAddress,
        payment: input.payment,
        totals: input.totals,
        tracking,
        requiresSignature: false,
        paymentIntentId: input.paymentIntentId,
        paymentStatus: "pending",
        deliveryMethod: input.deliveryMethod,
        activity: appendActivity(undefined, {
          actorEmail: input.customerEmail,
          kind: "placed",
          message: "Order placed",
          timestamp: placedAt,
        }),
      };
      data.orders.push(record);
      await writeFile(data);
      return record;
    });
  }

  async updateTracking(
    id: string,
    input: UpdateTrackingInput,
  ): Promise<OrderRecord | null> {
    return this.mutate(id, (existing) => ({
      ...existing,
      status: input.status ?? existing.status,
      tracking: input.tracking ?? existing.tracking,
      requiresSignature:
        input.requiresSignature ?? existing.requiresSignature,
      expectedDelivery:
        input.expectedDelivery === null
          ? undefined
          : (input.expectedDelivery ?? existing.expectedDelivery),
    }));
  }

  async advanceStage(
    id: string,
    input: AdvanceStageInput,
  ): Promise<OrderRecord | null> {
    return this.mutate(id, (existing) => {
      if (existing.status === "cancelled") return existing;
      const canonical = ensureCanonicalTracking(existing.tracking);
      const currentIdx = currentStepIndex(canonical);
      const timestamp = input.timestamp ?? nowIso();

      // Mark current step complete (or set its timestamp if blank).
      let tracking = setStep(canonical, currentIdx, {
        status: "complete",
        timestamp: canonical[currentIdx].timestamp ?? timestamp,
      });

      const nextIdx = currentIdx + 1;
      const becomesDelivered = nextIdx >= tracking.length;
      if (!becomesDelivered) {
        tracking = setStep(tracking, nextIdx, {
          status: "current",
          timestamp: tracking[nextIdx].timestamp ?? timestamp,
        });
      }

      const status = becomesDelivered
        ? "delivered"
        : deriveOrderStatus(tracking);

      const advancedFrom = canonical[currentIdx]?.label ?? "step";
      const advancedTo = becomesDelivered
        ? "Delivered"
        : (tracking[nextIdx]?.label ?? "next step");

      return {
        ...existing,
        tracking,
        status,
        activity: appendActivity(existing.activity, {
          actorEmail: input.actor.email,
          kind: "advanced",
          timestamp,
          message: `Advanced from “${advancedFrom}” to “${advancedTo}”`,
        }),
      };
    });
  }

  async revertStage(
    id: string,
    input: AdvanceStageInput,
  ): Promise<OrderRecord | null> {
    return this.mutate(id, (existing) => {
      if (existing.status === "cancelled") return existing;
      const canonical = ensureCanonicalTracking(existing.tracking);
      const lastComplete = lastCompleteIndex(canonical);
      if (lastComplete <= 0) return existing; // never revert the placed step

      // Move "current" pointer back: clear all later steps to upcoming, set lastComplete to current.
      let tracking = canonical.map((step, i) => {
        if (i < lastComplete) return step;
        if (i === lastComplete) {
          return {
            ...step,
            status: "current" as TrackingStepStatus,
          };
        }
        return {
          ...step,
          status: "upcoming" as TrackingStepStatus,
          timestamp: undefined,
        };
      });
      tracking = ensureCanonicalTracking(tracking);

      const status = deriveOrderStatus(tracking);
      const revertedFrom = canonical[lastComplete + 1]?.label ?? "next step";
      const revertedTo = canonical[lastComplete]?.label ?? "previous step";

      return {
        ...existing,
        tracking,
        status,
        activity: appendActivity(existing.activity, {
          actorEmail: input.actor.email,
          kind: "reverted",
          message: `Reverted from “${revertedFrom}” back to “${revertedTo}”`,
        }),
      };
    });
  }

  async cancelOrder(
    id: string,
    input: CancelOrderInput,
  ): Promise<OrderRecord | null> {
    return this.mutate(id, (existing) => {
      if (existing.status === "cancelled") return existing;
      const reason = input.reason.trim();
      return {
        ...existing,
        status: "cancelled",
        cancellationReason: reason.length > 0 ? reason : "Cancelled by admin",
        activity: appendActivity(existing.activity, {
          actorEmail: input.actor.email,
          kind: "cancelled",
          message:
            reason.length > 0
              ? `Cancelled the order. Reason: ${reason}`
              : "Cancelled the order",
        }),
      };
    });
  }

  async restoreOrder(
    id: string,
    input: RestoreOrderInput,
  ): Promise<OrderRecord | null> {
    return this.mutate(id, (existing) => {
      if (existing.status !== "cancelled") return existing;
      const canonical = ensureCanonicalTracking(existing.tracking);
      const status = deriveOrderStatus(canonical);
      return {
        ...existing,
        status,
        cancellationReason: undefined,
        tracking: canonical,
        activity: appendActivity(existing.activity, {
          actorEmail: input.actor.email,
          kind: "restored",
          message: "Restored the order from cancelled",
        }),
      };
    });
  }

  async updateShipping(
    id: string,
    input: UpdateShippingInput,
  ): Promise<OrderRecord | null> {
    return this.mutate(id, (existing) => {
      const nextCarrier =
        input.carrier === null
          ? undefined
          : (input.carrier ?? existing.carrier);
      const trimmedCarrierName = input.carrierName?.trim();
      const nextCarrierName =
        nextCarrier !== "other"
          ? undefined
          : input.carrierName === null
            ? undefined
            : trimmedCarrierName && trimmedCarrierName.length > 0
              ? trimmedCarrierName
              : existing.carrierName;
      const trimmed = input.trackingNumber?.trim();
      const nextTracking =
        input.trackingNumber === null
          ? undefined
          : trimmed && trimmed.length > 0
            ? trimmed
            : existing.trackingNumber;

      const carrierLabel = formatCarrier(nextCarrier, nextCarrierName) ?? "—";
      return {
        ...existing,
        carrier: nextCarrier,
        carrierName: nextCarrierName,
        trackingNumber: nextTracking,
        activity: appendActivity(existing.activity, {
          actorEmail: input.actor.email,
          kind: "shipping-updated",
          message: nextTracking
            ? `Set carrier to ${carrierLabel}, tracking # ${nextTracking}`
            : `Updated carrier to ${carrierLabel}`,
        }),
      };
    });
  }

  async updateNotes(
    id: string,
    input: UpdateNotesInput,
  ): Promise<OrderRecord | null> {
    return this.mutate(id, (existing) => {
      const trimmed = input.adminNotes.trim();
      return {
        ...existing,
        adminNotes: trimmed.length > 0 ? trimmed : undefined,
        activity: appendActivity(existing.activity, {
          actorEmail: input.actor.email,
          kind: "notes-updated",
          message:
            trimmed.length > 0
              ? "Updated internal notes"
              : "Cleared internal notes",
        }),
      };
    });
  }

  async updateExpectedDelivery(
    id: string,
    input: UpdateExpectedDeliveryInput,
  ): Promise<OrderRecord | null> {
    return this.mutate(id, (existing) => ({
      ...existing,
      expectedDelivery: input.expectedDelivery ?? undefined,
      activity: appendActivity(existing.activity, {
        actorEmail: input.actor.email,
        kind: "expected-delivery-updated",
        message: input.expectedDelivery
          ? `Set expected delivery to ${input.expectedDelivery}`
          : "Cleared expected delivery",
      }),
    }));
  }

  async updateSignature(
    id: string,
    input: UpdateSignatureInput,
  ): Promise<OrderRecord | null> {
    return this.mutate(id, (existing) => ({
      ...existing,
      requiresSignature: input.requiresSignature,
      activity: appendActivity(existing.activity, {
        actorEmail: input.actor.email,
        kind: "signature-updated",
        message: input.requiresSignature
          ? "Required signature on delivery"
          : "Removed signature requirement",
      }),
    }));
  }

  async recordRefund(
    id: string,
    input: RecordRefundInput,
  ): Promise<OrderRecord | null> {
    return this.mutate(id, (existing) => {
      const message =
        input.activityMessage ?? defaultRefundActivityMessage(input.refund);
      const kind = refundActivityKind(input.refund, existing.refund);
      return {
        ...existing,
        refund: input.refund,
        activity: appendActivity(existing.activity, {
          actorEmail: input.actor.email,
          kind,
          message,
        }),
      };
    });
  }

  private async mutate(
    id: string,
    transform: (existing: OrderRecord) => OrderRecord,
  ): Promise<OrderRecord | null> {
    return this.withLock(async () => {
      const data = await readFile();
      const index = data.orders.findIndex((order) => order.id === id);
      if (index === -1) return null;
      const next = transform(data.orders[index]);
      data.orders[index] = next;
      await writeFile(data);
      return next;
    });
  }

  private withLock<T>(work: () => Promise<T>): Promise<T> {
    const previous = this.mutex;
    let release: () => void = () => {};
    this.mutex = new Promise<void>((resolve) => {
      release = resolve;
    });
    return previous.then(async () => {
      try {
        return await work();
      } finally {
        release();
      }
    });
  }
}

async function readFile(): Promise<FileShape> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<FileShape>;
    if (!parsed || !Array.isArray(parsed.orders)) {
      return { orders: [] };
    }
    return { orders: parsed.orders };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { orders: [] };
    }
    throw error;
  }
}

async function writeFile(data: FileShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, FILE_PATH);
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && "code" in value;
}
