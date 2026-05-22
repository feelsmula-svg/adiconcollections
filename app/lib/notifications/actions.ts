"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/app/lib/auth/server";
import { getNotificationRepository } from "./notification-repository";
import type { AdminNotification } from "./types";

export interface NotificationListResult {
  notifications: AdminNotification[];
  unreadCount: number;
}

export async function listAdminNotifications(
  limit = 30,
): Promise<NotificationListResult> {
  const actor = await requireAdmin();
  const repo = await getNotificationRepository();
  const [notifications, unreadCount] = await Promise.all([
    repo.list(limit),
    repo.countUnread(actor.id),
  ]);
  return { notifications, unreadCount };
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const actor = await requireAdmin();
    const repo = await getNotificationRepository();
    return repo.countUnread(actor.id);
  } catch {
    return 0;
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  const actor = await requireAdmin();
  const trimmed = id.trim();
  if (!trimmed) return;
  const repo = await getNotificationRepository();
  await repo.markRead(trimmed, actor.id);
  revalidatePath("/admin");
}

export async function markAllNotificationsRead(): Promise<void> {
  const actor = await requireAdmin();
  const repo = await getNotificationRepository();
  await repo.markAllRead(actor.id);
  revalidatePath("/admin");
}
