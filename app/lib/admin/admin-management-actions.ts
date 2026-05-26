"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  requireAdmin,
  toPublicUser,
} from "@/app/lib/auth/server";
import { getUserRepository } from "@/app/lib/auth/user-repository";
import type { PublicUser } from "@/app/lib/auth/types";
import { notifyUser } from "@/app/lib/notifications/notify";

const promoteSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Enter a valid email"),
});

export interface AdminMutationResult {
  ok: boolean;
  error?: string;
  user?: PublicUser;
}

export async function approveAdminRequest(
  userId: string,
): Promise<AdminMutationResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Admin access required" };
  }
  const id = userId.trim();
  if (!id) return { ok: false, error: "Missing user id" };

  const repo = await getUserRepository();
  const user = await repo.findById(id);
  if (!user || user.role !== "admin") {
    return { ok: false, error: "Pending admin not found" };
  }
  if (user.adminStatus !== "pending") {
    return { ok: false, error: "That admin is not pending approval" };
  }
  const updated = await repo.updateAdminStatus(id, "approved");
  if (!updated) {
    return { ok: false, error: "Could not approve admin" };
  }
  // Let the newly-approved admin know they can sign in now.
  void notifyUser({
    userId: updated.id,
    kind: "other",
    title: "Your AdiCon admin access is approved",
    body:
      `Hi ${updated.name || "there"}, your admin access has been approved. ` +
      `You can now sign in and start managing AdiCon Collections.`,
    link: "/admin",
    email: updated.email,
    emailSubject: "You're approved — welcome to AdiCon admin",
  });
  revalidatePath("/admin/settings");
  revalidatePath("/admin/customers");
  return { ok: true, user: toPublicUser(updated) };
}

export async function rejectAdminRequest(
  userId: string,
): Promise<AdminMutationResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Admin access required" };
  }
  const id = userId.trim();
  if (!id) return { ok: false, error: "Missing user id" };

  const repo = await getUserRepository();
  const user = await repo.findById(id);
  if (!user || user.role !== "admin") {
    return { ok: false, error: "Pending admin not found" };
  }
  if (user.adminStatus !== "pending") {
    return { ok: false, error: "That admin is not pending approval" };
  }
  // Rejection demotes the pending admin back to a regular customer account.
  const updated = await repo.updateRole(id, "customer");
  if (!updated) {
    return { ok: false, error: "Could not reject admin" };
  }
  revalidatePath("/admin/settings");
  revalidatePath("/admin/customers");
  return { ok: true, user: toPublicUser(updated) };
}

export async function deleteAdmin(
  userId: string,
): Promise<AdminMutationResult> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { ok: false, error: "Admin access required" };
  }
  const id = userId.trim();
  if (!id) return { ok: false, error: "Missing user id" };

  if (id === actor.id) {
    return { ok: false, error: "You cannot delete your own account." };
  }

  const repo = await getUserRepository();
  const target = await repo.findById(id);
  if (!target || target.role !== "admin") {
    return { ok: false, error: "Admin not found" };
  }

  const primary = await repo.findPrimaryAdmin();
  if (primary && primary.id === id) {
    return {
      ok: false,
      error: "The primary admin cannot be deleted.",
    };
  }

  const removed = await repo.delete(id);
  if (!removed) {
    return { ok: false, error: "Could not delete admin" };
  }
  revalidatePath("/admin/settings");
  revalidatePath("/admin/customers");
  return { ok: true, user: toPublicUser(target) };
}

export interface PromoteResult {
  ok: boolean;
  error?: string;
  user?: PublicUser;
}

export async function promoteUserToAdminByEmail(
  input: z.infer<typeof promoteSchema>,
): Promise<PromoteResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Admin access required" };
  }

  const parsed = promoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid email",
    };
  }

  const repo = await getUserRepository();
  const user = await repo.findByEmail(parsed.data.email);
  if (!user) {
    return {
      ok: false,
      error: "No customer found with that email. They must sign up first.",
    };
  }
  if (user.role === "admin") {
    return {
      ok: false,
      error: "That user is already an admin.",
    };
  }

  const updated = await repo.updateRole(user.id, "admin");
  if (!updated) {
    return { ok: false, error: "Could not update the user's role" };
  }

  revalidatePath("/admin/customers");
  revalidatePath("/admin/settings");
  return { ok: true, user: toPublicUser(updated) };
}
