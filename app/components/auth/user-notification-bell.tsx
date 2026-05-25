"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  Box,
  IconButton,
  NotificationDetailModal,
  Row,
  Stack,
  Text,
  type NotificationDetailItem,
} from "@/app/components/ui";
import { cn } from "@/app/components/ui/cn";
import { useSession } from "@/app/lib/hooks/use-session";
import {
  listUserNotifications,
  markUserNotificationRead,
} from "@/app/lib/notifications/user-actions";
import {
  NOTIFICATION_ICON,
  NOTIFICATION_KIND_LABEL,
  NOTIFICATION_LINK_LABEL,
  type AdminNotification,
} from "@/app/lib/notifications/types";

const REFRESH_INTERVAL_MS = 60_000;

interface UserNotificationBellProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diffMs = Date.now() - then;
  if (diffMs < 60_000) return "just now";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function UserNotificationBell({
  size = "sm",
  className,
}: UserNotificationBellProps) {
  const { user, status } = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await listUserNotifications(30);
      setNotifications(list);
      setLoaded(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (status !== "authed") {
      setNotifications([]);
      setLoaded(false);
      return;
    }
    void refresh();
    const interval = setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [status, refresh]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!panelRef.current) return;
      if (panelRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  if (status !== "authed" || !user) return null;

  const unreadCount = notifications.filter(
    (entry) => !entry.readBy.includes(user.id),
  ).length;

  const handleClick = (entry: AdminNotification) => {
    if (!entry.readBy.includes(user.id)) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === entry.id ? { ...n, readBy: [...n.readBy, user.id] } : n,
        ),
      );
      startTransition(async () => {
        try {
          await markUserNotificationRead(entry.id);
        } catch {
          // ignore
        }
      });
    }
    setOpen(false);
    setActiveId(entry.id);
  };

  const activeEntry =
    notifications.find((entry) => entry.id === activeId) ?? null;

  const activeDetail: NotificationDetailItem | null = activeEntry
    ? {
        id: activeEntry.id,
        title: activeEntry.title,
        body: activeEntry.body,
        link: activeEntry.link,
        createdAt: activeEntry.createdAt,
        iconName: NOTIFICATION_ICON[activeEntry.kind],
      }
    : null;
  const activeUnread = activeEntry
    ? !activeEntry.readBy.includes(user.id)
    : false;

  const badgeLabel =
    unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <Box className={cn("relative inline-flex", className)}>
      <IconButton
        icon="notifications"
        label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        variant="plain"
        size={size}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      />
      {badgeLabel ? (
        <Box className="pointer-events-none absolute -top-1 -right-1 min-w-[18px] h-[18px] px-[5px] rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center">
          {badgeLabel}
        </Box>
      ) : null}

      <Box
        ref={panelRef}
        role="menu"
        aria-label="Notifications"
        aria-hidden={!open}
        className={cn(
          "absolute right-0 top-[calc(100%+10px)] z-[60] w-[340px] max-w-[calc(100vw-24px)] origin-top-right",
          "rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-[0_24px_48px_-12px_rgba(34,18,8,0.20)] overflow-hidden",
          "transition-all duration-150",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none",
        )}
      >
        <Row
          justify="between"
          align="center"
          gap="sm"
          className="px-md py-sm border-b border-outline-variant"
        >
          <Text variant="body-md" as="span" className="font-semibold">
            Notifications
          </Text>
          {unreadCount > 0 ? (
            <Text variant="body-sm" tone="muted" as="span" className="text-[11px]">
              {unreadCount} unread
            </Text>
          ) : null}
        </Row>

        <Box className="max-h-[420px] overflow-y-auto">
          {!loaded ? (
            <Box className="px-md py-lg">
              <Text variant="body-sm" tone="muted">
                Loading…
              </Text>
            </Box>
          ) : notifications.length === 0 ? (
            <Box className="px-md py-lg">
              <Stack gap="xs" align="center" className="text-center">
                <Text variant="body-sm" tone="muted">
                  You don&apos;t have any notifications yet.
                </Text>
              </Stack>
            </Box>
          ) : (
            <Stack gap="none">
              {notifications.map((entry) => {
                const unread = !entry.readBy.includes(user.id);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => handleClick(entry)}
                    disabled={pending}
                    className={cn(
                      "w-full text-left px-md py-sm border-b border-outline-variant/60 last:border-b-0 transition-colors",
                      unread
                        ? "bg-primary-fixed/30 hover:bg-primary-fixed/50"
                        : "hover:bg-surface-container-low",
                    )}
                  >
                    <Row gap="sm" align="start">
                      <Box
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-[2px]",
                          unread
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container text-on-surface-variant",
                        )}
                      >
                        <span
                          className="material-symbols-outlined text-[18px]"
                          aria-hidden
                          style={{ fontVariationSettings: '"FILL" 1' }}
                        >
                          {NOTIFICATION_ICON[entry.kind]}
                        </span>
                      </Box>
                      <Stack gap="none" className="flex-1 min-w-0">
                        <Row gap="xs" align="center" justify="between">
                          <Text
                            variant="body-sm"
                            as="span"
                            className={cn(
                              "truncate",
                              unread ? "font-semibold" : "font-medium",
                            )}
                          >
                            {entry.title}
                          </Text>
                          <Text
                            variant="body-sm"
                            tone="muted"
                            as="span"
                            className="text-[11px] shrink-0"
                          >
                            {formatRelative(entry.createdAt)}
                          </Text>
                        </Row>
                        {entry.body ? (
                          <Text
                            variant="body-sm"
                            tone="muted"
                            as="span"
                            className="text-[12px] line-clamp-2"
                          >
                            {entry.body}
                          </Text>
                        ) : null}
                      </Stack>
                      {unread ? (
                        <Box className="w-2 h-2 rounded-full bg-primary shrink-0 mt-[6px]" />
                      ) : null}
                    </Row>
                  </button>
                );
              })}
            </Stack>
          )}
        </Box>
      </Box>

      <NotificationDetailModal
        open={activeEntry !== null}
        onClose={() => setActiveId(null)}
        notification={activeDetail}
        unread={activeUnread}
        kindLabel={
          activeEntry ? NOTIFICATION_KIND_LABEL[activeEntry.kind] : undefined
        }
        linkLabel={
          activeEntry
            ? NOTIFICATION_LINK_LABEL[activeEntry.kind] ?? "View details"
            : "View details"
        }
      />
    </Box>
  );
}
