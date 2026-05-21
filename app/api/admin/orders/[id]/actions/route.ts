import { NextResponse } from "next/server";

import { AdminAccessError, requireAdmin } from "@/app/lib/auth/server";
import { getOrderRepository } from "@/app/lib/orders/order-repository";
import { orderActionSchema } from "@/app/lib/orders/schemas";
import type { OrderRecord, ShippingCarrier } from "@/app/lib/orders/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function isJson(request: Request): boolean {
  const ct = request.headers.get("content-type") ?? "";
  return ct.toLowerCase().startsWith("application/json");
}

export async function POST(request: Request, context: RouteContext) {
  let actorEmail: string;
  try {
    const admin = await requireAdmin();
    actorEmail = admin.email;
  } catch (error: unknown) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }
    throw error;
  }

  if (!isJson(request)) {
    return NextResponse.json(
      { success: false, error: "Content-Type must be application/json" },
      { status: 415 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = orderActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const repo = await getOrderRepository();
  const actor = { email: actorEmail };
  const input = parsed.data;

  let updated: OrderRecord | null = null;
  switch (input.action) {
    case "advance":
      updated = await repo.advanceStage(id, { actor });
      break;
    case "revert":
      updated = await repo.revertStage(id, { actor });
      break;
    case "cancel":
      updated = await repo.cancelOrder(id, { actor, reason: input.reason });
      break;
    case "restore":
      updated = await repo.restoreOrder(id, { actor });
      break;
    case "update-shipping":
      updated = await repo.updateShipping(id, {
        actor,
        carrier: input.carrier as ShippingCarrier | undefined,
        trackingNumber: input.trackingNumber ?? undefined,
      });
      break;
    case "update-notes":
      updated = await repo.updateNotes(id, {
        actor,
        adminNotes: input.adminNotes,
      });
      break;
    case "update-expected-delivery": {
      const value =
        input.expectedDelivery && input.expectedDelivery.length > 0
          ? input.expectedDelivery
          : null;
      updated = await repo.updateExpectedDelivery(id, {
        actor,
        expectedDelivery: value,
      });
      break;
    }
    case "update-signature":
      updated = await repo.updateSignature(id, {
        actor,
        requiresSignature: input.requiresSignature,
      });
      break;
  }

  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Order not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: updated });
}
