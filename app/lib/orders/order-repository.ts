import "server-only";

import type {
  ListOrdersFilters,
  OrderRecord,
  OrderStatus,
  ShippingCarrier,
  TrackingStep,
} from "./types";

export interface UpdateTrackingInput {
  status?: OrderStatus;
  tracking?: TrackingStep[];
  expectedDelivery?: string | null;
  requiresSignature?: boolean;
}

export interface ActorContext {
  email: string;
}

export interface AdvanceStageInput {
  actor: ActorContext;
  timestamp?: string;
}

export interface CancelOrderInput {
  actor: ActorContext;
  reason: string;
}

export interface RestoreOrderInput {
  actor: ActorContext;
}

export interface UpdateShippingInput {
  actor: ActorContext;
  carrier?: ShippingCarrier | null;
  trackingNumber?: string | null;
}

export interface UpdateNotesInput {
  actor: ActorContext;
  adminNotes: string;
}

export interface UpdateExpectedDeliveryInput {
  actor: ActorContext;
  expectedDelivery: string | null;
}

export interface UpdateSignatureInput {
  actor: ActorContext;
  requiresSignature: boolean;
}

export interface OrderRepository {
  list(filters?: ListOrdersFilters): Promise<OrderRecord[]>;
  findById(id: string): Promise<OrderRecord | null>;
  findActiveForUser(userId: string): Promise<OrderRecord | null>;
  updateTracking(
    id: string,
    input: UpdateTrackingInput,
  ): Promise<OrderRecord | null>;
  advanceStage(
    id: string,
    input: AdvanceStageInput,
  ): Promise<OrderRecord | null>;
  revertStage(id: string, input: AdvanceStageInput): Promise<OrderRecord | null>;
  cancelOrder(
    id: string,
    input: CancelOrderInput,
  ): Promise<OrderRecord | null>;
  restoreOrder(
    id: string,
    input: RestoreOrderInput,
  ): Promise<OrderRecord | null>;
  updateShipping(
    id: string,
    input: UpdateShippingInput,
  ): Promise<OrderRecord | null>;
  updateNotes(
    id: string,
    input: UpdateNotesInput,
  ): Promise<OrderRecord | null>;
  updateExpectedDelivery(
    id: string,
    input: UpdateExpectedDeliveryInput,
  ): Promise<OrderRecord | null>;
  updateSignature(
    id: string,
    input: UpdateSignatureInput,
  ): Promise<OrderRecord | null>;
}

let repoPromise: Promise<OrderRepository> | null = null;

export async function getOrderRepository(): Promise<OrderRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      const { JsonOrderRepository } = await import(
        "./repositories/json-order-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[orders] JsonOrderRepository is DEV-ONLY. It is not safe across serverless invocations or multiple workers.",
        );
      }
      return new JsonOrderRepository();
    })();
  }
  return repoPromise;
}
