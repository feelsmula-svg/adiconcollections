"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/app/lib/auth/server";
import { getAddressRepository } from "./address-repository";
import { addressInputSchema, type AddressInputSchema } from "./schemas";
import type { AddressRecord } from "./types";

export interface AddressActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  address?: AddressRecord;
}

export async function listAddresses(): Promise<AddressRecord[]> {
  const user = await getSessionUser();
  if (!user) return [];
  const repo = await getAddressRepository();
  return repo.listForUser(user.id);
}

export async function createAddress(
  input: AddressInputSchema,
): Promise<AddressActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in to add an address" };

  const parsed = addressInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const repo = await getAddressRepository();
  const address = await repo.create(user.id, parsed.data);
  revalidate();
  return { ok: true, address };
}

export async function updateAddress(
  id: string,
  input: AddressInputSchema,
): Promise<AddressActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in to update an address" };

  const parsed = addressInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const repo = await getAddressRepository();
  const address = await repo.update(id, user.id, parsed.data);
  if (!address) return { ok: false, error: "Address not found" };
  revalidate();
  return { ok: true, address };
}

export async function deleteAddress(
  id: string,
): Promise<AddressActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in to remove an address" };

  const repo = await getAddressRepository();
  const removed = await repo.delete(id, user.id);
  if (!removed) return { ok: false, error: "Address not found" };
  revalidate();
  return { ok: true };
}

function revalidate(): void {
  revalidatePath("/account");
  revalidatePath("/account/profile");
}
