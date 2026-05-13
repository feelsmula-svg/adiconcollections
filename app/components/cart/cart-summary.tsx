"use client";

import { useCart } from "@/app/lib/cart/cart-context";
import { formatCents } from "@/app/lib/cart/format";
import { Divider, Row, Stack, Text } from "@/app/components/ui";

export function CartSummary() {
  const { itemCount, subtotalCents, taxCents, totalCents } = useCart();
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
          Shipping
        </Text>
        <Text variant="body-sm" tone="secondary" className="font-bold">
          FREE
        </Text>
      </Row>
      <Row justify="between">
        <Text variant="body-sm" tone="muted">
          Taxes
        </Text>
        <Text variant="body-sm">{formatCents(taxCents)}</Text>
      </Row>
      <Divider />
      <Row justify="between" align="center">
        <Text variant="body-md" className="font-bold">
          Total
        </Text>
        <Text variant="body-md" tone="primary" className="font-bold">
          {formatCents(totalCents)}
        </Text>
      </Row>
    </Stack>
  );
}
