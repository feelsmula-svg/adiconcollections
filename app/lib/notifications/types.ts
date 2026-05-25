export type NotificationKind =
  | "order-placed"
  | "order-cancelled"
  | "admin-signup-pending"
  | "admin-reply"
  | "other";

export interface AdminNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  /** Optional internal link to navigate to (e.g., /admin/orders/{id}). */
  link?: string;
  /**
   * When set, this notification is private to one user (a customer or admin).
   * When undefined, it is broadcast to every approved admin.
   */
  recipientUserId?: string;
  createdAt: string;
  /** User IDs who have marked this notification as read. */
  readBy: string[];
}

export const NOTIFICATION_ICON: Record<NotificationKind, string> = {
  "order-placed": "shopping_bag",
  "order-cancelled": "cancel",
  "admin-signup-pending": "shield_person",
  "admin-reply": "mark_email_read",
  other: "notifications",
};

export const NOTIFICATION_KIND_LABEL: Record<NotificationKind, string> = {
  "order-placed": "Order placed",
  "order-cancelled": "Order cancelled",
  "admin-signup-pending": "Admin signup pending",
  "admin-reply": "Concierge reply",
  other: "Notification",
};

export const NOTIFICATION_LINK_LABEL: Partial<Record<NotificationKind, string>> = {
  "order-placed": "View order",
  "order-cancelled": "View order",
  "admin-signup-pending": "Review request",
  "admin-reply": "Open message",
};
