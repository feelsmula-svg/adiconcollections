"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Box,
  Button,
  Card,
  Heading,
  Icon,
  NotificationDetailModal,
  Row,
  Stack,
  Text,
  type NotificationDetailItem,
} from "@/app/components/ui";
import { markUserNotificationRead } from "@/app/lib/notifications/user-actions";
import {
  NOTIFICATION_ICON,
  NOTIFICATION_KIND_LABEL,
  NOTIFICATION_LINK_LABEL,
  type AdminNotification,
} from "@/app/lib/notifications/types";

interface UserNotificationsPanelProps {
  notifications: AdminNotification[];
  selfUserId: string;
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

export function UserNotificationsPanel({
  notifications,
  selfUserId,
}: UserNotificationsPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);

  if (notifications.length === 0) return null;

  const handleClick = (entry: AdminNotification) => {
    if (!entry.readBy.includes(selfUserId)) {
      startTransition(async () => {
        try {
          await markUserNotificationRead(entry.id);
        } catch {
          // ignore — modal still opens
        }
        router.refresh();
      });
    }
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
    ? !activeEntry.readBy.includes(selfUserId)
    : false;

  return (
    <>
    <Card variant="outlined" padding="lg" rounded="2xl">
      <Stack gap="md">
        <Row gap="sm" align="center">
          <Box className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
            <Icon
              name="notifications"
              filled
              className="text-on-primary-container"
            />
          </Box>
          <Stack gap="none" className="flex-1">
            <Heading level={2} variant="headline-sm">
              Latest messages
            </Heading>
            <Text variant="body-sm" tone="muted">
              Replies from our concierge team and order updates show up here.
            </Text>
          </Stack>
        </Row>

        <Stack gap="xs">
          {notifications.slice(0, 5).map((entry) => {
            const unread = !entry.readBy.includes(selfUserId);
            return (
              <Button
                key={entry.id}
                type="button"
                variant="ghost"
                size="md"
                caps={false}
                onClick={() => handleClick(entry)}
                disabled={pending}
                className="w-full text-left rounded-xl px-md py-sm"
              >
                <Row gap="sm" align="start" className="w-full">
                  <Box
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-[2px] ${
                      unread
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
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
                        className={`truncate ${unread ? "font-semibold" : "font-medium"}`}
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
                        className="text-[12px] whitespace-normal line-clamp-2"
                      >
                        {entry.body}
                      </Text>
                    ) : null}
                  </Stack>
                  {unread ? (
                    <Box className="w-2 h-2 rounded-full bg-primary shrink-0 mt-[6px]" />
                  ) : null}
                </Row>
              </Button>
            );
          })}
        </Stack>
      </Stack>
    </Card>

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
    </>
  );
}
