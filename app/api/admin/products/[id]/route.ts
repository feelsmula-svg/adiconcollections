import { NextResponse } from "next/server";

import { AdminAccessError, requireAdmin } from "@/app/lib/auth/server";
import { getProductRepository } from "@/app/lib/products/product-repository";
import { updateProductSchema } from "@/app/lib/products/schemas";
import type { ProductCategory } from "@/app/lib/products/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function isJson(request: Request): boolean {
  const ct = request.headers.get("content-type") ?? "";
  return ct.toLowerCase().startsWith("application/json");
}

async function guardAdmin(): Promise<NextResponse | null> {
  try {
    await requireAdmin();
    return null;
  } catch (error: unknown) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }
    throw error;
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await guardAdmin();
  if (guard) return guard;

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

  const parsed = updateProductSchema.safeParse(body);
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
  const repo = await getProductRepository();
  const updated = await repo.update(id, {
    ...parsed.data,
    category: parsed.data.category as ProductCategory | undefined,
    // Derive primary imageUrl from the first uploaded image if a new gallery
    // was provided. Leave existing imageUrl untouched otherwise.
    imageUrl: parsed.data.images?.[0],
    images: parsed.data.images,
  });

  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Product not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const { id } = await context.params;
  const repo = await getProductRepository();
  const deleted = await repo.delete(id);
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: "Product not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true, data: { id } });
}
