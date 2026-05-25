import "server-only";

import { getSessionUser } from "@/app/lib/auth/server";
import { getOrderRepository } from "@/app/lib/orders/order-repository";
import type {
  OrderDetail,
  OrderRecord,
  OrderSummary,
} from "@/app/lib/orders/types";

export {
  formatCurrency,
  formatOrderDate,
  formatOrderTimestamp,
} from "@/app/lib/orders/format";

export type {
  OrderStatus,
  OrderSummary,
  OrderItem,
  OrderAddress,
  OrderPayment,
  OrderTotals,
  TrackingStep,
  TrackingStepKey,
  TrackingStepStatus,
  OrderDetail,
} from "@/app/lib/orders/types";

function toSummary(order: OrderDetail): OrderSummary {
  return {
    id: order.id,
    reference: order.reference,
    placedAt: order.placedAt,
    status: order.status,
    total: order.total,
    productName: order.productName,
    expectedDelivery: order.expectedDelivery,
    imageUrl: order.imageUrl,
  };
}

export async function listOrders(): Promise<OrderSummary[]> {
  const user = await getSessionUser();
  if (!user) return [];
  const repo = await getOrderRepository();
  const records = await repo.list({ userId: user.id });
  return records.map(toSummary);
}

export async function listOrderRecords(): Promise<OrderRecord[]> {
  const user = await getSessionUser();
  if (!user) return [];
  const repo = await getOrderRepository();
  return repo.list({ userId: user.id });
}

export async function getActiveShipment(): Promise<OrderSummary | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const repo = await getOrderRepository();
  // The repo already restricts to active statuses (processing + in-transit).
  // We surface both here so a freshly placed order appears on the dashboard
  // immediately instead of waiting until it ships.
  const active = await repo.findActiveForUser(user.id);
  return active ? toSummary(active) : null;
}

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const repo = await getOrderRepository();
  const order = await repo.findById(id);
  if (!order) return null;
  if (user.role !== "admin" && order.userId !== user.id) return null;
  return order;
}
