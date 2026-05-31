import { redirect } from "next/navigation";

import { AdminPage } from "@/app/components/admin/admin-page";
import {
  Badge,
  Box,
  Card,
  EmptyState,
  Icon,
  LinkButton,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { getSessionUser } from "@/app/lib/auth/server";
import { getMessageRepository } from "@/app/lib/messages/message-repository";
import {
  CONTACT_STATUS_LABEL,
  type ContactMessage,
} from "@/app/lib/messages/types";

export const dynamic = "force-dynamic";

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return iso;
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

function preview(value: string, limit = 140): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= limit) return cleaned;
  return `${cleaned.slice(0, limit - 1)}…`;
}

function statusTone(
  status: ContactMessage["status"],
): "primary" | "secondary" | "neutral" {
  if (status === "new") return "primary";
  if (status === "replied") return "secondary";
  return "neutral";
}

export default async function AdminMessagesPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const repo = await getMessageRepository();
  const messages = await repo.list();
  const newCount = messages.filter((m) => m.status === "new").length;

  return (
    <AdminPage
      title="Messages"
      subtitle={
        newCount > 0
          ? `${newCount} new message${newCount === 1 ? "" : "s"} from the contact form.`
          : "Messages from the contact form."
      }
    >
      {messages.length === 0 ? (
        <Card variant="outlined" padding="lg" rounded="2xl">
          <EmptyState
            title="No messages yet"
            description="When a customer submits the contact form, the message will appear here."
          />
        </Card>
      ) : (
        <Stack gap="sm">
          {messages.map((message) => {
            const repliesCount = message.replies.length;
            return (
              <LinkButton
                key={message.id}
                href={`/admin/messages/${message.id}`}
                variant="ghost"
                caps={false}
                className="rounded-2xl text-left"
              >
                <Card
                  variant="outlined"
                  padding="lg"
                  rounded="2xl"
                  className="w-full"
                >
                  <Stack gap="sm">
                    <Row justify="between" align="start" gap="sm" wrap>
                      <Stack gap="none" className="min-w-0 flex-1">
                        <Row gap="sm" align="center" wrap>
                          <Text
                            variant="body-md"
                            as="span"
                            className="font-semibold"
                          >
                            {message.subject}
                          </Text>
                          <Badge tone={statusTone(message.status)} size="sm">
                            {CONTACT_STATUS_LABEL[message.status]}
                          </Badge>
                          {repliesCount > 0 ? (
                            <Badge tone="neutral" size="sm">
                              {repliesCount}{" "}
                              {repliesCount === 1 ? "reply" : "replies"}
                            </Badge>
                          ) : null}
                        </Row>
                        <Text variant="body-sm" tone="muted">
                          {message.name} · {message.email}
                        </Text>
                      </Stack>
                      <Row gap="xs" align="center" className="shrink-0">
                        <Icon
                          name="schedule"
                          className="text-on-surface-variant text-sm"
                        />
                        <Text variant="body-sm" tone="muted" as="span">
                          {formatRelative(message.createdAt)}
                        </Text>
                      </Row>
                    </Row>
                    <Box>
                      <Text variant="body-sm" tone="muted">
                        {preview(message.body)}
                      </Text>
                    </Box>
                  </Stack>
                </Card>
              </LinkButton>
            );
          })}
        </Stack>
      )}
    </AdminPage>
  );
}
