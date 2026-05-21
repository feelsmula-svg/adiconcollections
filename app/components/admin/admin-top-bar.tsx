import {
  Box,
  Heading,
  IconButton,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";

interface AdminTopBarProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function AdminTopBar({ title, subtitle, onMenuClick }: AdminTopBarProps) {
  return (
    <Box
      role="banner"
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant px-md sm:px-lg md:px-xl lg:px-2xl py-md"
    >
      <Row align="center" gap="md">
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
    </Box>
  );
}
