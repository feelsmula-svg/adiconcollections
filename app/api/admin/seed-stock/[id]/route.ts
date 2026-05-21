import { NextResponse } from "next/server";
import { z } from "zod";

import { AdminAccessError, requireAdmin } from "@/app/lib/auth/server";
import { getSeedProductMeta } from "@/app/lib/products/seed-stock";
import {
  getSeedStockRepository,
  SeedStockError,
} from "@/app/lib/products/seed-stock-repository";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const patchSchema = z.object({
  stock: z.number().int().min(0).max(1_000_000),
});

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

  const parsed = patchSchema.safeParse(body);
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
  if (!getSeedProductMeta(id)) {
    return NextResponse.json(
      { success: false, error: "Unknown seed product" },
      { status: 404 },
    );
  }

  try {
    const repo = await getSeedStockRepository();
    const stock = await repo.set(id, parsed.data.stock);
    return NextResponse.json({ success: true, data: { id, stock } });
  } catch (error: unknown) {
    if (error instanceof SeedStockError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }
    throw error;
  }
}
