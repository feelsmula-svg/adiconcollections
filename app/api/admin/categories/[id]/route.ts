import { NextResponse } from "next/server";

import { AdminAccessError, requireAdmin } from "@/app/lib/auth/server";
import {
  ProtectedCategoryError,
  getCategoryRepository,
} from "@/app/lib/taxonomy/category-repository";
import { updateCategorySchema } from "@/app/lib/taxonomy/schemas";

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

  const parsed = updateCategorySchema.safeParse(body);
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
  const repo = await getCategoryRepository();
  const updated = await repo.update(id, {
    label: parsed.data.label,
    description: parsed.data.description,
  });
  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Category not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const { id } = await context.params;
  try {
    const repo = await getCategoryRepository();
    const deleted = await repo.delete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: { id } });
  } catch (error: unknown) {
    if (error instanceof ProtectedCategoryError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 },
      );
    }
    throw error;
  }
}
