import { notFound, redirect } from "next/navigation";

import { AdminShell } from "@/app/components/admin/admin-shell";
import { MessageReplyForm } from "@/app/components/admin/message-reply-form";
import {
  Badge,
  Box,
  Card,
  Heading,
  Icon,
  LinkButton,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { getSessionUser } from "@/app/lib/auth/server";
import { getMessageRepository } from "@/app/lib/messages/message-repository";
import { CONTACT_STATUS_LABEL } from "@/app/lib/messages/types";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

export default async function AdminMessageDetailPage({
  params,
}: RouteContext) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const { id } = await params;
  const repo = await getMessageRepository();
  const message = await repo.findById(id);
  if (!message) notFound();

  const customerHasAccount = Boolean(message.userId);

  return (
    <AdminShell
      user={user}
      active="messages"
      title={message.subject}
      subtitle={`From ${message.name} <${message.email}> · ${formatTimestamp(message.createdAt)}`}
    >
      <Stack gap="md">
        <LinkButton
          href="/admin/messages"
          variant="ghost"
          size="sm"
          caps={false}
          className="self-start rounded-full px-0 -ml-xs"
        >
          <Icon name="arrow_back" className="text-lg" />
          <Text as="span" variant="body-sm">
            All messages
          </Text>
        </LinkButton>

        <Card variant="outlined" padding="lg" rounded="2xl">
          <Stack gap="md">
            <Row justify="between" align="center" wrap gap="sm">
              <Stack gap="none">
                <Text
                  variant="label-caps"
                  tone="muted"
                  as="span"
                  className="tracking-[0.18em]"
                >
                  Original message
                </Text>
                <Heading level={2} variant="headline-sm">
                  {message.subject}
                </Heading>
              </Stack>
              <Badge
                tone={
                  message.status === "new"
                    ? "primary"
                    : message.status === "replied"
                      ? "secondary"
                      : "neutral"
                }
                size="sm"
              >
                {CONTACT_STATUS_LABEL[message.status]}
              </Badge>
            </Row>
            <Stack gap="xs">
              <Text variant="body-sm" tone="muted">
                {message.name} · {message.email}
                {customerHasAccount ? " · Customer account on file" : ""}
              </Text>
              <Text variant="body-sm" tone="muted">
                {formatTimestamp(message.createdAt)}
              </Text>
            </Stack>
            <Box className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md">
              <Text variant="body-md" className="whitespace-pre-wrap">
                {message.body}
              </Text>
            </Box>
          </Stack>
        </Card>

        {message.replies.length > 0 ? (
          <Stack gap="sm">
            <Text
              variant="label-caps"
              tone="muted"
              as="span"
              className="tracking-[0.18em]"
            >
              Replies ({message.replies.length})
            </Text>
            {message.replies.map((reply) => (
              <Card
                key={reply.id}
                variant="outlined"
                padding="lg"
                rounded="2xl"
              >
                <Stack gap="sm">
                  <Row justify="between" align="center" wrap gap="sm">
                    <Stack gap="none">
                      <Text variant="body-md" className="font-semibold">
                        {reply.authorName || reply.authorEmail}
                      </Text>
                      <Text variant="body-sm" tone="muted">
                        {formatTimestamp(reply.createdAt)}
                      </Text>
                    </Stack>
                    <Badge tone="neutral" size="sm">
                      {reply.channel === "email"
                        ? "Email"
                        : reply.channel === "in-app"
                          ? "In-app"
                          : "Email + in-app"}
                    </Badge>
                  </Row>
                  <Text variant="body-md" className="whitespace-pre-wrap">
                    {reply.body}
                  </Text>
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : null}

        <MessageReplyForm
          messageId={message.id}
          status={message.status}
          customerHasAccount={customerHasAccount}
        />
      </Stack>
    </AdminShell>
  );
}
