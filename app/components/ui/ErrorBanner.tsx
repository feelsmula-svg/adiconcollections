import type { ReactNode } from "react";

import { Card } from "./Card";
import { Text } from "./Text";

interface ErrorBannerProps {
  message?: string | null;
  children?: ReactNode;
}

export function ErrorBanner({ message, children }: ErrorBannerProps) {
  const content = message ?? children;
  if (!content) return null;
  return (
    <Card variant="tonal" padding="md" rounded="lg">
      <Text variant="body-sm" tone="error" role="alert" aria-live="polite">
        {content}
      </Text>
    </Card>
  );
}
