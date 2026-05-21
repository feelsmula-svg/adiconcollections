import type { ReactNode } from "react";

import { Box } from "./Box";
import { Stack } from "./Stack";
import { Text } from "./Text";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Box className={className ?? "px-lg py-2xl"}>
      <Stack gap="sm" align="center">
        <Text variant="body-md" as="span" className="font-semibold">
          {title}
        </Text>
        {description ? (
          <Text variant="body-sm" tone="muted">
            {description}
          </Text>
        ) : null}
        {action}
      </Stack>
    </Box>
  );
}
