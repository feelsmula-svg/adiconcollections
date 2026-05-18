"use client";

import { useCartStore } from "@/app/lib/state/cart-store";
import { formatCents } from "@/app/lib/cart/format";
import type { CartLine } from "@/app/lib/cart/types";
import {
  Badge,
  Box,
  Button,
  Card,
  Heading,
  Icon,
  Image,
  QuantityStepper,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";

interface CartItemProps {
  line: CartLine;
}

export function CartItem({ line }: CartItemProps) {
  const { product, quantity } = line;
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <Card variant="elevated" padding="sm">
      <Row gap="sm" align="stretch">
        <Box className="relative w-14 h-16 shrink-0 rounded-lg overflow-hidden bg-surface-variant">
          <Image
            src={product.imageSrc}
            alt={product.imageAlt}
            fill
            sizes="56px"
            rounded="lg"
          />
          {product.badge && (
            <Box className="absolute top-[2px] left-[2px]">
              <Badge tone={product.badge.tone} size="sm">
                {product.badge.label}
              </Badge>
            </Box>
          )}
        </Box>

        <Stack gap="xs" className="flex-1 min-w-0">
          <Row justify="between" align="start" gap="sm">
            <Stack gap="none" className="min-w-0">
              <Heading
                level={3}
                variant="headline-sm"
                size="body-sm"
                className="font-bold truncate leading-snug"
              >
                {product.name}
              </Heading>
              {product.description && (
                <Text variant="body-sm" tone="muted" className="text-[11px]">
                  {product.description}
                </Text>
              )}
            </Stack>
            <Text
              variant="body-sm"
              tone="primary"
              className="whitespace-nowrap font-bold"
            >
              {formatCents(product.priceCents * quantity)}
            </Text>
          </Row>

          <Row justify="between" align="center" className="mt-auto">
            <QuantityStepper
              value={quantity}
              onChange={(q) => setQuantity(product.id, q)}
              size="sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(product.id)}
              className="text-on-surface-variant hover:text-error hover:bg-transparent gap-xs px-0 tracking-[0.05em] text-[11px]"
            >
              <Icon name="delete" className="text-base" />
              Remove
            </Button>
          </Row>
        </Stack>
      </Row>
    </Card>
  );
}
