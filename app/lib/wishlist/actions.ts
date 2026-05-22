"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/app/lib/auth/server";
import { getWishlistRepository } from "./wishlist-repository";

export interface WishlistActionResult {
  ok: boolean;
  error?: string;
  ids: string[];
}

export async function getWishlistIds(): Promise<string[]> {
  const user = await getSessionUser();
  if (!user) return [];
  const repo = await getWishlistRepository();
  return repo.listIds(user.id);
}

export async function toggleWishlist(
  productId: string,
): Promise<WishlistActionResult> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "Sign in to save items to your wishlist", ids: [] };
  }
  const trimmed = productId.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: "Invalid product", ids: [] };
  }
  const repo = await getWishlistRepository();
  const ids = await repo.toggle(user.id, trimmed);
  revalidatePath("/wishlist");
  return { ok: true, ids };
}
