"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Box } from "./Box";
import { Button } from "./Button";
import { Heading } from "./Heading";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { LinkButton } from "./LinkButton";
import { Row } from "./Row";
import { Stack } from "./Stack";
import { Text } from "./Text";
import { Modal } from "./Modal";
import { cn } from "./cn";

export interface NotificationDetailItem {
  id: string;
  title: string;
  body?: string;
  link?: string;
  createdAt: string;
  /** Material symbol name used for the leading icon. */
  iconName: string;
}

interface NotificationDetailModalProps {
  open: boolean;
  onClose: () => void;
  notification: NotificationDetailItem | null;
  /** Optional secondary label shown above the title (e.g., "Admin reply"). */
  kindLabel?: string;
  /** Label used for the link button when `notification.link` is present. */
  linkLabel?: string;
  /**
   * When true, the leading icon uses the unread accent. Pass the current
   * read state from the parent so the modal matches the list item visual.
   */
  unread?: boolean;
}

function formatAbsolute(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function NotificationDetailModal({
  open,
  onClose,
  notification,
  kindLabel,
  linkLabel = "View details",
  unread = false,
}: NotificationDetailModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleLinkClick = () => {
    if (!notification?.link) return;
    const href = notification.link;
    startTransition(() => {
      onClose();
      router.push(href);
    });
  };

  return (
    <Modal
      open={open && notification !== null}
      onClose={onClose}
      width="md"
      ariaLabel={notification?.title ?? "Notification"}
    >
      {notification ? (
        <>
          <Box className="px-lg pt-lg pb-md flex items-start justify-between gap-md">
            <Row gap="sm" align="start" className="min-w-0 flex-1">
              <Box
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  unread
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant",
                )}
              >
                <Icon name={notification.iconName} filled className="text-xl" />
              </Box>
              <Stack gap="xs" className="min-w-0 flex-1">
                {kindLabel ? (
                  <Text
                    variant="label-caps"
                    tone="muted"
                    as="span"
                    className="text-label-caps"
                  >
                    {kindLabel}
                  </Text>
                ) : null}
                <Heading level={2} variant="headline-sm" className="break-words">
                  {notification.title}
                </Heading>
                <Text variant="body-sm" tone="muted" as="span">
                  {formatAbsolute(notification.createdAt)}
                </Text>
              </Stack>
            </Row>
            <IconButton
              icon="close"
              label="Close"
              size="sm"
              variant="plain"
              onClick={onClose}
            />
          </Box>

          <Box className="flex-1 overflow-y-auto px-lg pb-lg">
            {notification.body ? (
              <Text
                variant="body-md"
                tone="default"
                className="whitespace-pre-wrap break-words"
              >
                {notification.body}
              </Text>
            ) : (
              <Text variant="body-sm" tone="muted">
                No additional details were included with this notification.
              </Text>
            )}
          </Box>

          <Box className="px-lg pb-lg pt-sm border-t border-outline-variant">
            <Row gap="sm" justify="end" align="center" wrap>
              <Button
                variant="outline"
                size="md"
                caps={false}
                onClick={onClose}
                className="rounded-full"
              >
                Close
              </Button>
              {notification.link ? (
                <LinkButton
                  href={notification.link}
                  variant="primary"
                  size="md"
                  caps={false}
                  className="rounded-full"
                  onClick={(event) => {
                    event.preventDefault();
                    handleLinkClick();
                  }}
                  aria-disabled={pending}
                >
                  {linkLabel}
                </LinkButton>
              ) : null}
            </Row>
          </Box>
        </>
      ) : null}
    </Modal>
  );
}
