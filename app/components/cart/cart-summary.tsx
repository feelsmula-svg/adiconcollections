"use client";

import {
  useCartItemCount,
  useCartSubtotalCents,
} from "@/app/lib/state/cart-store";
import { useHydrated } from "@/app/lib/state/hydration";
import { formatCents } from "@/app/lib/cart/format";
import { Divider, Row, Stack, Text } from "@/app/components/ui";

export function CartSummary() {
  const hydrated = useHydrated();
  const itemCountRaw = useCartItemCount();
  const subtotalCentsRaw = useCartSubtotalCents();
  const itemCount = hydrated ? itemCountRaw : 0;
  const subtotalCents = hydrated ? subtotalCentsRaw : 0;
  const itemLabel = itemCount === 1 ? "item" : "items";

  return (
    <Stack gap="xs">
      <Row justify="between">
        <Text variant="body-sm" tone="muted">
          Subtotal ({itemCount} {itemLabel})
        </Text>
        <Text variant="body-sm">{formatCents(subtotalCents)}</Text>
      </Row>
      <Row justify="between">
        <Text variant="body-sm" tone="muted">
          Shipping & tax
        </Text>
        <Text variant="body-sm" tone="muted" className="italic">
          Calculated at checkout
        </Text>
      </Row>
      <Divider />
      <Row justify="between" align="center">
        <Text variant="body-md" className="font-bold">
          Estimated subtotal
        </Text>
        <Text variant="body-md" tone="primary" className="font-bold">
          {formatCents(subtotalCents)}
        </Text>
      </Row>
    </Stack>
  );
}
