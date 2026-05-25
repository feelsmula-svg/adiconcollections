import { notFound, redirect } from "next/navigation";

import { AccountShell } from "@/app/components/account/account-shell";
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

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

export default async function AccountMessageDetailPage({
  params,
}: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/?signin=1&next=/account");
  }

  const { id } = await params;
  const repo = await getMessageRepository();
  const message = await repo.findById(id);
  if (!message) notFound();

  // Authorize: the message must belong to this user. We match either by
  // userId (set when the sender was signed in at submission time) or by
  // email (for messages that were sent anonymously but reach an account
  // that owns the same address).
  const ownsByUserId = Boolean(message.userId && message.userId === user.id);
  const ownsByEmail =
    !message.userId &&
    message.email.trim().toLowerCase() === user.email.trim().toLowerCase();
  if (!ownsByUserId && !ownsByEmail) {
    notFound();
  }

  const sortedReplies = [...message.replies].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  return (
    <AccountShell user={user} active="home">
      <Stack gap="md">
        <LinkButton
          href="/account"
          variant="ghost"
          size="sm"
          caps={false}
          className="self-start rounded-full px-0 -ml-xs"
        >
          <Icon name="arrow_back" className="text-lg" />
          <Text as="span" variant="body-sm">
            Back to account
          </Text>
        </LinkButton>

        <Stack gap="xs">
          <Text
            variant="label-caps"
            tone="primary"
            as="span"
            className="tracking-[0.2em]"
          >
            Message thread
          </Text>
          <Heading
            level={1}
            variant="display-lg"
            size="headline-md"
            className="md:text-headline-md lg:text-display-lg"
          >
            {message.subject}
          </Heading>
        </Stack>

        <Card variant="outlined" padding="lg" rounded="2xl">
          <Stack gap="md">
            <Row justify="between" align="center" wrap gap="sm">
              <Stack gap="none">
                <Text variant="body-md" className="font-semibold">
                  You
                </Text>
                <Text variant="body-sm" tone="muted">
                  {formatTimestamp(message.createdAt)}
                </Text>
              </Stack>
              <Badge tone="neutral" size="sm">
                Original message
              </Badge>
            </Row>
            <Box className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md">
              <Text variant="body-md" className="whitespace-pre-wrap">
                {message.body}
              </Text>
            </Box>
          </Stack>
        </Card>

        {sortedReplies.length > 0 ? (
          <Stack gap="sm">
            <Text
              variant="label-caps"
              tone="muted"
              as="span"
              className="tracking-[0.18em]"
            >
              Replies ({sortedReplies.length})
            </Text>
            {sortedReplies.map((reply) => (
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
                        {reply.authorName || "AdiCon concierge"}
                      </Text>
                      <Text variant="body-sm" tone="muted">
                        {formatTimestamp(reply.createdAt)}
                      </Text>
                    </Stack>
                    <Badge tone="primary" size="sm">
                      Concierge
                    </Badge>
                  </Row>
                  <Text variant="body-md" className="whitespace-pre-wrap">
                    {reply.body}
                  </Text>
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : (
          <Card variant="outlined" padding="lg" rounded="2xl">
            <Text variant="body-sm" tone="muted">
              Our concierge team hasn&apos;t replied yet. We typically respond
              within one business day.
            </Text>
          </Card>
        )}

        <Box>
          <LinkButton
            href="/contact"
            variant="primary"
            size="sm"
            caps={false}
            className="rounded-full"
          >
            Send another message
          </LinkButton>
        </Box>
      </Stack>
    </AccountShell>
  );
}
