import { NextResponse } from "next/server";

import { AdminAccessError, requireAdmin } from "@/app/lib/auth/server";
import type { ProductCategory } from "@/app/lib/products/types";
import {
  DuplicateHairTypeError,
  getHairTypeRepository,
} from "@/app/lib/taxonomy/hair-type-repository";
import { hairTypeSchema } from "@/app/lib/taxonomy/schemas";

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

export async function GET() {
  const guard = await guardAdmin();
  if (guard) return guard;
  const repo = await getHairTypeRepository();
  const types = await repo.list();
  return NextResponse.json({ success: true, data: types });
}

export async function POST(request: Request) {
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

  const parsed = hairTypeSchema.safeParse(body);
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

  try {
    const repo = await getHairTypeRepository();
    const created = await repo.create({
      slug: parsed.data.slug,
      label: parsed.data.label,
      description: parsed.data.description,
      category: parsed.data.category as ProductCategory,
    });
    return NextResponse.json(
      { success: true, data: created },
      { status: 201 },
    );
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
