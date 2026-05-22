import "server-only";

import { randomUUID } from "node:crypto";
import type { Collection, Document } from "mongodb";

import { getDb } from "@/app/lib/db/mongo";
import { sanitiseMongoRegex } from "@/app/lib/db/mongo-search";

import {
  DELIVERY_METHOD_DAYS,
  TRACKING_STEP_KEYS,
  TRACKING_STEP_LABELS,
  TRACKING_STEP_TO_STATUS,
  SHIPPING_CARRIER_LABELS,
} from "../types";
import type {
  ListOrdersFilters,
  OrderActivityEntry,
  OrderRecord,
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
  RestoreOrderInput,
  UpdateExpectedDeliveryInput,
  UpdateNotesInput,
  UpdateShippingInput,
  UpdateSignatureInput,
  UpdateTrackingInput,
} from "../order-repository";

const COLLECTION = "orders";

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
  const focus = currentStepIndex(tracking);
  const key = tracking[focus]?.key as TrackingStepKey | undefined;
  if (!key) return "processing";
  return TRACKING_STEP_TO_STATUS[key];
}

async function collection(): Promise<Collection<OrderRecord & Document>> {
  const db = await getDb();
  const coll = db.collection<OrderRecord & Document>(COLLECTION);
  await Promise.all([
    coll.createIndex({ id: 1 }, { unique: true }),
    coll.createIndex(
      { paymentIntentId: 1 },
      { unique: true, sparse: true },
    ),
    coll.createIndex({ userId: 1, placedAt: -1 }),
  ]);
  return coll;
}

function buildReference(): string {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `#AC-${n}`;
}

function buildInitialTracking(timestamp: string): TrackingStep[] {
  return TRACKING_STEP_KEYS.map((key, index) => {
    if (index === 0) {
      return {
        key,
        label: TRACKING_STEP_LABELS[key],
        status: "complete" as TrackingStepStatus,
        timestamp,
      };
    }
    if (index === 1) {
      return {
        key,
        label: TRACKING_STEP_LABELS[key],
        status: "current" as TrackingStepStatus,
        timestamp,
      };
    }
    return {
      key,
      label: TRACKING_STEP_LABELS[key],
      status: "upcoming" as TrackingStepStatus,
    };
  });
}

function deriveProductName(items: CreateOrderInput["items"]): string {
  if (items.length === 0) return "Order";
  if (items.length === 1) return items[0].name;
  return `${items[0].name} + ${items.length - 1} more`;
}

function computeExpectedDelivery(
  placedAtIso: string,
  deliveryMethod: CreateOrderInput["deliveryMethod"],
): string {
  const days = DELIVERY_METHOD_DAYS[deliveryMethod];
  const date = new Date(placedAtIso);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function strip(record: OrderRecord & { _id?: unknown }): OrderRecord {
  const { _id, ...rest } = record;
  void _id;
  return rest;
}

export class MongoOrderRepository implements OrderRepository {
  async list(filters: ListOrdersFilters = {}): Promise<OrderRecord[]> {
    const coll = await collection();
    const query: Record<string, unknown> = {};
    if (filters.userId) query.userId = filters.userId;
    if (filters.status) query.status = filters.status;
    if (filters.q?.trim()) {
      const q = sanitiseMongoRegex(filters.q.trim());
      query.$or = [
        { reference: { $regex: q, $options: "i" } },
        { customerEmail: { $regex: q, $options: "i" } },
        { customerName: { $regex: q, $options: "i" } },
        { productName: { $regex: q, $options: "i" } },
      ];
    }
    const docs = await coll.find(query).sort({ placedAt: -1 }).toArray();
    return docs.map(strip);
  }

  async findById(id: string): Promise<OrderRecord | null> {
    const coll = await collection();
    const doc = await coll.findOne({ id });
    return doc ? strip(doc) : null;
  }

  async findActiveForUser(userId: string): Promise<OrderRecord | null> {
    const coll = await collection();
    const doc = await coll
      .find({
        userId,
        status: { $in: ["in-transit", "processing"] },
      })
      .sort({ placedAt: -1 })
      .limit(1)
      .next();
    return doc ? strip(doc) : null;
  }

  async findByPaymentIntent(
    paymentIntentId: string,
  ): Promise<OrderRecord | null> {
    const coll = await collection();
    const doc = await coll.findOne({ paymentIntentId });
    return doc ? strip(doc) : null;
  }

  async updateTotalsByPaymentIntent(
    paymentIntentId: string,
    input: { totals: OrderRecord["totals"] },
  ): Promise<OrderRecord | null> {
    const coll = await collection();
    const result = await coll.findOneAndUpdate(
      { paymentIntentId },
      {
        $set: {
          totals: input.totals,
          total: input.totals.total,
        },
      },
      { returnDocument: "after" },
    );
    return result ? strip(result) : null;
  }

  async create(input: CreateOrderInput): Promise<OrderRecord> {
    const coll = await collection();
    const existing = await coll.findOne({
      paymentIntentId: input.paymentIntentId,
    });
    if (existing) return strip(existing);

    const placedAt = nowIso();
    const expectedDelivery = computeExpectedDelivery(
      placedAt,
      input.deliveryMethod,
    );
    const record: OrderRecord = {
      id: randomUUID(),
      reference: buildReference(),
      placedAt,
      status: "processing",
      total: input.totals.total,
      productName: deriveProductName(input.items),
      imageUrl: input.items[0]?.imageUrl,
      expectedDelivery,
      userId: input.userId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      items: input.items,
      shippingAddress: input.shippingAddress,
      payment: input.payment,
      totals: input.totals,
      tracking: buildInitialTracking(placedAt),
      requiresSignature: false,
      paymentIntentId: input.paymentIntentId,
      deliveryMethod: input.deliveryMethod,
      activity: [
        {
          id: randomUUID(),
          timestamp: placedAt,
          actorEmail: input.customerEmail,
          kind: "placed",
          message: "Order placed",
        },
      ],
    };

    try {
      await coll.insertOne(record);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: number }).code === 11000
      ) {
        const dup = await coll.findOne({
          paymentIntentId: input.paymentIntentId,
        });
        if (dup) return strip(dup);
      }
      throw error;
    }
    return record;
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
      if (lastComplete <= 0) return existing;

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
      const trimmed = input.trackingNumber?.trim();
      const nextTracking =
        input.trackingNumber === null
          ? undefined
          : trimmed && trimmed.length > 0
            ? trimmed
            : existing.trackingNumber;

      const carrierLabel = nextCarrier
        ? SHIPPING_CARRIER_LABELS[nextCarrier]
        : "—";
      return {
        ...existing,
        carrier: nextCarrier,
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

  private async mutate(
    id: string,
    transform: (existing: OrderRecord) => OrderRecord,
  ): Promise<OrderRecord | null> {
    const coll = await collection();
    const existing = await coll.findOne({ id });
    if (!existing) return null;
    const next = transform(strip(existing));
    await coll.replaceOne({ id }, next);
    return next;
  }
}
