"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/app/lib/cart/cart-context";
import {
  Box,
  Button,
  Drawer,
  Heading,
  Icon,
  IconButton,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { CartItem } from "./cart-item";
import { CartPromoCode } from "./cart-promo-code";
import { CartSummary } from "./cart-summary";

export function CartDrawer() {
  const router = useRouter();
  const { isOpen, close, lines, itemCount } = useCart();
  const hasItems = lines.length > 0;
  const itemLabel = itemCount === 1 ? "item" : "items";

  const onCheckout = () => {
    close();
    router.push("/checkout");
  };

  return (
    <Drawer
      open={isOpen}
      onClose={close}
      width="md"
      ariaLabel="Your shopping bag"
    >
      <Row
        justify="between"
        align="center"
        gap="sm"
        className="px-md py-sm border-b border-outline-variant bg-surface-container-low shrink-0"
      >
        <Stack gap="none">
          <Heading
            level={2}
            variant="headline-sm"
            size="body-md"
            className="font-bold"
          >
            Your bag
          </Heading>
          <Text variant="body-sm" tone="muted" className="text-[11px]">
            {itemCount} {itemLabel}
          </Text>
        </Stack>
        <IconButton
          icon="close"
          label="Close shopping bag"
          onClick={close}
          variant="plain"
          size="sm"
        />
      </Row>

      <Box className="flex-1 overflow-y-auto px-md py-md">
        {hasItems ? (
          <Stack gap="md">
            <Stack gap="sm">
              {lines.map((line) => (
                <CartItem key={line.product.id} line={line} />
              ))}
            </Stack>
            <CartPromoCode />
          </Stack>
        ) : (
          <EmptyCart onClose={close} />
        )}
      </Box>

      {hasItems && (
        <Box className="border-t border-outline-variant bg-surface-container-low px-md py-sm shrink-0">
          <Stack gap="sm">
            <CartSummary />
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={onCheckout}
              className="gap-xs tracking-[0.1em]"
            >
              <Icon name="lock" className="text-base" />
              Secure checkout
            </Button>
          </Stack>
        </Box>
      )}
    </Drawer>
  );
}

interface EmptyCartProps {
  onClose: () => void;
}

function EmptyCart({ onClose }: EmptyCartProps) {
  return (
    <Stack gap="md" align="center" justify="center" className="h-full py-2xl">
      <Icon
        name="shopping_bag"
        className="text-5xl text-on-surface-variant opacity-60"
      />
      <Stack gap="xs" align="center">
        <Heading
          level={3}
          variant="headline-sm"
          size="body-md"
          className="font-bold"
        >
          Your bag is empty
        </Heading>
        <Text variant="body-sm" tone="muted" align="center">
          Add a product to start your collection.
        </Text>
      </Stack>
      <Button variant="primary" size="sm" onClick={onClose}>
        Continue shopping
      </Button>
    </Stack>
  );
}
