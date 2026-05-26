import { NextResponse } from "next/server";

import { getAllStorefrontProducts } from "@/app/lib/products/storefront";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getAllStorefrontProducts();
    return NextResponse.json({ products });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Could not load products";
    console.error("[api/products] error:", message);
    return NextResponse.json(
      { error: "Could not load products" },
      { status: 500 },
    );
  }
}
