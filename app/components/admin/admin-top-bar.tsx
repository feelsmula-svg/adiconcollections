import {
  Box,
  Heading,
  IconButton,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { AdminNotificationBell } from "./admin-notification-bell";

interface AdminTopBarProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  selfUserId?: string;
}

export function AdminTopBar({
  title,
  subtitle,
  onMenuClick,
  selfUserId,
}: AdminTopBarProps) {
  return (
    <Box
      role="banner"
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant px-md sm:px-lg md:px-xl lg:px-2xl py-md"
    >
      <Row align="center" gap="md" justify="between">
        <Row align="center" gap="md" className="min-w-0">
          {onMenuClick ? (
            <IconButton
              icon="menu"
              label="Open navigation"
              variant="plain"
              size="md"
              onClick={onMenuClick}
              className="lg:hidden shrink-0"
            />
          ) : null}
          <Stack gap="none" className="min-w-0">
            <Heading
              level={1}
              variant="headline-sm"
              tone="primary"
              className="truncate"
            >
              {title}
            </Heading>
            {subtitle ? (
              <Text variant="body-sm" tone="muted" className="truncate">
                {subtitle}
              </Text>
            ) : null}
          </Stack>
        </Row>
        {selfUserId ? (
          <AdminNotificationBell selfUserId={selfUserId} />
        ) : null}
      </Row>
    </Box>
  );
}
