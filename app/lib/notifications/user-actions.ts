"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/app/lib/auth/server";
import { getNotificationRepository } from "./notification-repository";
import type { AdminNotification } from "./types";

export async function listUserNotifications(
  limit = 10,
): Promise<AdminNotification[]> {
  const user = await getSessionUser();
  if (!user) return [];
  const repo = await getNotificationRepository();
  return repo.listForUser(user.id, limit);
}

export async function markUserNotificationRead(id: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  const trimmed = id.trim();
  if (!trimmed) return;
  const repo = await getNotificationRepository();
  // Only mark read if the notification actually belongs to this user.
  const list = await repo.listForUser(user.id, 200);
  if (!list.some((entry) => entry.id === trimmed)) return;
  await repo.markRead(trimmed, user.id);
  revalidatePath("/account");
}
