import { NextResponse } from "next/server";

import { AdminAccessError, requireAdmin } from "@/app/lib/auth/server";
import { getOrderRepository } from "@/app/lib/orders/order-repository";
import { updateOrderTrackingSchema } from "@/app/lib/orders/schemas";
import type {
  OrderStatus,
  TrackingStep,
  TrackingStepKey,
} from "@/app/lib/orders/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function isJson(request: Request): boolean {
  const ct = request.headers.get("content-type") ?? "";
  return ct.toLowerCase().startsWith("application/json");
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
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

  const parsed = updateOrderTrackingSchema.safeParse(body);
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
  const tracking: TrackingStep[] | undefined = parsed.data.tracking?.map(
    (step) => ({
      key: step.key as TrackingStepKey,
      label: step.label,
      timestamp:
        step.timestamp && step.timestamp.length > 0
          ? step.timestamp
          : undefined,
      status: step.status,
    }),
  );

  const expectedDelivery =
    parsed.data.expectedDelivery === undefined
      ? undefined
      : parsed.data.expectedDelivery.length === 0
        ? null
        : parsed.data.expectedDelivery;

  const repo = await getOrderRepository();
  const updated = await repo.updateTracking(id, {
    status: parsed.data.status as OrderStatus | undefined,
    tracking,
    expectedDelivery,
    requiresSignature: parsed.data.requiresSignature,
  });

  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Order not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: updated });
}
