"use client";

import {
  Avatar,
  Button,
  Card,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { useCartStore } from "@/app/lib/state/cart-store";

interface MemberCardProps {
  fallbackName: string;
  fallbackEmail: string;
}

export function MemberCard({
  fallbackName,
  fallbackEmail,
}: MemberCardProps) {
  const openCart = useCartStore((state) => state.open);

  const name = fallbackName || fallbackEmail.split("@")[0];
  const initials = getInitials(name);

  return (
    <Card variant="tonal" padding="lg" rounded="2xl">
      <Row gap="md" align="center" className="mb-md">
        <Avatar
          initials={initials}
          size="md"
          tone="primary"
          label={`Signed in as ${name}`}
        />
        <Stack gap="none" className="min-w-0">
          <Text
            variant="body-md"
            as="span"
            className="font-semibold truncate"
          >
            {name}
          </Text>
          <Text
            variant="body-sm"
            tone="muted"
            as="span"
            className="truncate"
          >
            {fallbackEmail}
          </Text>
        </Stack>
      </Row>
      <Button
        variant="primary"
        size="sm"
        fullWidth
        caps={false}
        className="rounded-full"
        onClick={() => openCart()}
      >
        View Cart
      </Button>
    </Card>
  );
}

function getInitials(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) return "•";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return trimmed.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
