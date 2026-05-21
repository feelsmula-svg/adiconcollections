import { NextResponse } from "next/server";

import { AdminAccessError, requireAdmin } from "@/app/lib/auth/server";
import type { ProductCategory } from "@/app/lib/products/types";
import {
  DuplicateHairTypeError,
  getHairTypeRepository,
} from "@/app/lib/taxonomy/hair-type-repository";
import { updateHairTypeSchema } from "@/app/lib/taxonomy/schemas";

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

  const parsed = updateHairTypeSchema.safeParse(body);
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
  try {
    const repo = await getHairTypeRepository();
    const updated = await repo.update(id, {
      ...parsed.data,
      category: parsed.data.category as ProductCategory | undefined,
    });
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Hair type not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    if (error instanceof DuplicateHairTypeError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 },
      );
    }
    throw error;
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const { id } = await context.params;
  const repo = await getHairTypeRepository();
  const deleted = await repo.delete(id);
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: "Hair type not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true, data: { id } });
}
