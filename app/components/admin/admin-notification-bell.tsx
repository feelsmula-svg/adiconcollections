"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  Box,
  Button,
  IconButton,
  NotificationDetailModal,
  Row,
  Stack,
  Text,
  type NotificationDetailItem,
} from "@/app/components/ui";
import { cn } from "@/app/components/ui/cn";
import {
  listAdminNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/lib/notifications/actions";
import {
  NOTIFICATION_ICON,
  NOTIFICATION_KIND_LABEL,
  NOTIFICATION_LINK_LABEL,
  type AdminNotification,
} from "@/app/lib/notifications/types";

interface AdminNotificationBellProps {
  selfUserId: string;
}

const REFRESH_INTERVAL_MS = 60_000;

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

export function AdminNotificationBell({
  selfUserId,
}: AdminNotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [pending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await listAdminNotifications();
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
      setLoaded(true);
    } catch {
      // ignore — bell renders empty
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

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

  const handleItemClick = (entry: AdminNotification) => {
    if (!entry.readBy.includes(selfUserId)) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === entry.id ? { ...n, readBy: [...n.readBy, selfUserId] } : n,
        ),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      startTransition(async () => {
        try {
          await markNotificationRead(entry.id);
        } catch {
          // ignore
        }
      });
    }
    setOpen(false);
    setActiveId(entry.id);
  };

  const activeEntry = useMemo(
    () => notifications.find((entry) => entry.id === activeId) ?? null,
    [notifications, activeId],
  );

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
    ? !activeEntry.readBy.includes(selfUserId)
    : false;

  const handleMarkAll = () => {
    if (unreadCount === 0) return;
    const userId = selfUserId;
    setNotifications((prev) =>
      prev.map((n) =>
        n.readBy.includes(userId) ? n : { ...n, readBy: [...n.readBy, userId] },
      ),
    );
    setUnreadCount(0);
    startTransition(async () => {
      try {
        await markAllNotificationsRead();
        void refresh();
      } catch {
        // ignore
      }
    });
  };

  const badgeLabel =
    unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <Box className="relative inline-flex">
      <IconButton
        icon="notifications"
        label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        variant="plain"
        size="md"
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
        aria-label="Admin notifications"
        aria-hidden={!open}
        className={cn(
          "fixed inset-x-md top-[72px] z-[60] origin-top",
          "sm:absolute sm:inset-x-auto sm:right-0 sm:left-auto sm:top-[calc(100%+10px)] sm:w-[360px] sm:max-w-[calc(100vw-24px)] sm:origin-top-right",
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
          <Button
            variant="ghost"
            size="sm"
            caps={false}
            onClick={handleMarkAll}
            disabled={pending || unreadCount === 0}
            className="text-[12px]"
          >
            Mark all read
          </Button>
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
                  You&apos;re all caught up.
                </Text>
              </Stack>
            </Box>
          ) : (
            <Stack gap="none">
              {notifications.map((entry) => {
                const unread = !entry.readBy.includes(selfUserId);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => handleItemClick(entry)}
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
                          style={{
                            fontVariationSettings: '"FILL" 1',
                          }}
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
