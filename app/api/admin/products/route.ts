import { NextResponse } from "next/server";

import { AdminAccessError, requireAdmin } from "@/app/lib/auth/server";
import { getProductRepository } from "@/app/lib/products/product-repository";
import { productSchema } from "@/app/lib/products/schemas";
import type { ProductCategory } from "@/app/lib/products/types";

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
  const repo = await getProductRepository();
  const products = await repo.list();
  return NextResponse.json({ success: true, data: products });
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

  const parsed = productSchema.safeParse(body);
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

  const repo = await getProductRepository();
  const product = await repo.create({
    ...parsed.data,
    category: parsed.data.category as ProductCategory,
  });

  return NextResponse.json({ success: true, data: product }, { status: 201 });
}
