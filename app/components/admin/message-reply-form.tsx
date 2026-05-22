"use client";

import {
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import {
  Badge,
  Box,
  Button,
  Card,
  FormField,
  Heading,
  RadioOption,
  Row,
  Stack,
  Text,
  Textarea,
} from "@/app/components/ui";
import {
  replyToContactMessage,
  updateContactMessageStatus,
} from "@/app/lib/messages/actions";
import type {
  ContactMessageStatus,
  ContactReplyChannel,
} from "@/app/lib/messages/types";

interface MessageReplyFormProps {
  messageId: string;
  status: ContactMessageStatus;
  customerHasAccount: boolean;
}

export function MessageReplyForm({
  messageId,
  status,
  customerHasAccount,
}: MessageReplyFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [statusPending, startStatusTransition] = useTransition();
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState<ContactReplyChannel>(
    customerHasAccount ? "both" : "email",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setErrorMessage(null);
    setFeedback(null);

    startTransition(async () => {
      const result = await replyToContactMessage({
        messageId,
        body,
        channel,
      });
      if (!result.ok) {
        setErrorMessage(result.error ?? "Could not send the reply");
        return;
      }
      setBody("");
      const parts: string[] = [];
      if (channel === "email" || channel === "both") {
        parts.push(
          result.emailDelivered
            ? "email sent"
            : "email logged (no provider configured)",
        );
      }
      if ((channel === "in-app" || channel === "both") && result.inAppDelivered) {
        parts.push("notification delivered");
      } else if (
        (channel === "in-app" || channel === "both") &&
        !result.inAppDelivered
      ) {
        parts.push("no customer account on file — in-app skipped");
      }
      setFeedback(`Reply saved · ${parts.join(" · ")}.`);
      router.refresh();
    });
  };

  const setStatus = (next: ContactMessageStatus) => {
    if (statusPending) return;
    setErrorMessage(null);
    startStatusTransition(async () => {
      const result = await updateContactMessageStatus(messageId, next);
      if (!result.ok) {
        setErrorMessage(result.error ?? "Could not update status");
        return;
      }
      router.refresh();
    });
  };

  return (
    <Card variant="outlined" padding="lg" rounded="2xl">
      <form onSubmit={onSubmit} noValidate>
        <Stack gap="md">
          <Row justify="between" align="center" wrap gap="sm">
            <Heading level={2} variant="headline-sm">
              Reply to the customer
            </Heading>
            <Badge tone="neutral" size="sm">
              {customerHasAccount
                ? "Has customer account"
                : "Guest sender"}
            </Badge>
          </Row>

          <FormField label="Reply body" required>
            <Textarea
              rows={6}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write your reply here…"
              disabled={pending}
              required
            />
          </FormField>

          <Stack gap="sm">
            <Text
              variant="label-caps"
              tone="muted"
              as="span"
              className="tracking-[0.18em]"
            >
              Send via
            </Text>
            <Stack gap="xs">
              <RadioOption
                name="reply-channel"
                value="email"
                checked={channel === "email"}
                onChange={(value) =>
                  setChannel(value as ContactReplyChannel)
                }
              >
                <Stack gap="none">
                  <Text variant="body-md" className="font-semibold">
                    Email only
                  </Text>
                  <Text variant="body-sm" tone="muted">
                    Sends the reply to {`{customer email}`}.
                  </Text>
                </Stack>
              </RadioOption>
              <RadioOption
                name="reply-channel"
                value="in-app"
                checked={channel === "in-app"}
                onChange={(value) =>
                  setChannel(value as ContactReplyChannel)
                }
              >
                <Stack gap="none">
                  <Text variant="body-md" className="font-semibold">
                    In-app notification only
                  </Text>
                  <Text variant="body-sm" tone="muted">
                    {customerHasAccount
                      ? "Posts to the customer's in-app notifications."
                      : "Sender has no account — in-app step will be skipped."}
                  </Text>
                </Stack>
              </RadioOption>
              <RadioOption
                name="reply-channel"
                value="both"
                checked={channel === "both"}
                onChange={(value) =>
                  setChannel(value as ContactReplyChannel)
                }
              >
                <Stack gap="none">
                  <Text variant="body-md" className="font-semibold">
                    Email + in-app
                  </Text>
                  <Text variant="body-sm" tone="muted">
                    {customerHasAccount
                      ? "Belt-and-braces — they get both."
                      : "Unavailable — sender has no account."}
                  </Text>
                </Stack>
              </RadioOption>
            </Stack>
          </Stack>

          {errorMessage ? (
            <Text variant="body-sm" tone="error">
              {errorMessage}
            </Text>
          ) : null}
          {feedback ? (
            <Text variant="body-sm" tone="primary">
              {feedback}
            </Text>
          ) : null}

          <Row justify="between" align="center" wrap gap="sm">
            <Row gap="xs" align="center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                caps={false}
                disabled={statusPending || status === "archived"}
                onClick={() => setStatus("archived")}
              >
                Archive
              </Button>
              {status === "archived" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  caps={false}
                  disabled={statusPending}
                  onClick={() => setStatus("new")}
                >
                  Restore
                </Button>
              ) : null}
            </Row>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              caps={false}
              disabled={pending || body.trim().length === 0}
              className="rounded-full"
            >
              {pending ? "Sending…" : "Send reply"}
            </Button>
          </Row>
          <Box />
        </Stack>
      </form>
    </Card>
  );
}
