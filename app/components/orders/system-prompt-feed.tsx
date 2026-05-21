import {
  Box,
  Card,
  Heading,
  Icon,
  LinkButton,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { formatOrderTimestamp } from "@/app/lib/orders/format";
import type { SystemPrompt } from "@/app/lib/orders/system-prompts";

const TONE_BG: Record<SystemPrompt["tone"], string> = {
  primary: "bg-primary-fixed text-primary",
  secondary: "bg-secondary-fixed text-secondary",
  tertiary: "bg-tertiary-fixed text-tertiary",
  neutral: "bg-surface-container-high text-on-surface-variant",
  error: "bg-error-container text-on-error-container",
};

interface SystemPromptFeedProps {
  title: string;
  emptyMessage: string;
  prompts: SystemPrompt[];
  showOrderReference?: boolean;
  showActor?: boolean;
  hrefBuilder?: (prompt: SystemPrompt) => string;
}

export function SystemPromptFeed({
  title,
  emptyMessage,
  prompts,
  showOrderReference = false,
  showActor = false,
  hrefBuilder,
}: SystemPromptFeedProps) {
  return (
    <Card variant="outlined" padding="lg" rounded="2xl">
      <Stack gap="md">
        <Heading level={2} variant="headline-sm" size="body-lg">
          {title}
        </Heading>
        {prompts.length === 0 ? (
          <Text variant="body-sm" tone="muted">
            {emptyMessage}
          </Text>
        ) : (
          <Stack gap="md">
            {prompts.map((prompt) => (
              <Row key={prompt.id} gap="md" align="start">
                <Box
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${TONE_BG[prompt.tone]}`}
                >
                  <Icon name={prompt.icon} className="text-lg" />
                </Box>
                <Stack gap="none" className="flex-1 min-w-0">
                  <Text
                    variant="body-md"
                    as="span"
                    className="font-semibold truncate"
                  >
                    {prompt.title}
                  </Text>
                  {prompt.body ? (
                    <Text variant="body-sm" tone="muted" as="span">
                      {prompt.body}
                    </Text>
                  ) : null}
                  <Text
                    variant="label-caps"
                    tone="muted"
                    as="span"
                    className="text-[10px] tracking-[0.14em] mt-xs"
                  >
                    {formatOrderTimestamp(prompt.timestamp)}
                    {showOrderReference ? ` · ${prompt.orderReference}` : ""}
                    {showActor && prompt.actorEmail
                      ? ` · ${prompt.actorEmail}`
                      : ""}
                  </Text>
                </Stack>
                {hrefBuilder ? (
                  <LinkButton
                    href={hrefBuilder(prompt)}
                    variant="ghost"
                    size="sm"
                    caps={false}
                    className="rounded-full shrink-0"
                  >
                    Open
                  </LinkButton>
                ) : null}
              </Row>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
