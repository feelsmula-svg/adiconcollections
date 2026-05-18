"use client";

import { useCartItemCount, useCartStore } from "@/app/lib/state/cart-store";
import { useHydrated } from "@/app/lib/state/hydration";
import { Badge, Box, IconButton } from "@/app/components/ui";

interface CartTriggerButtonProps {
  size?: "sm" | "md" | "lg";
  variant?: "plain" | "tonal" | "outline" | "filled";
  className?: string;
}

export function CartTriggerButton({
  size = "md",
  variant = "plain",
  className,
}: CartTriggerButtonProps) {
  const open = useCartStore((state) => state.open);
  const hydrated = useHydrated();
  const itemCountRaw = useCartItemCount();
  const itemCount = hydrated ? itemCountRaw : 0;
  const label =
    itemCount === 0
      ? "Open shopping bag"
      : `Open shopping bag (${itemCount} ${itemCount === 1 ? "item" : "items"})`;

  return (
    <Box className={`relative inline-block ${className ?? ""}`}>
      <IconButton
        icon="shopping_bag"
        label={label}
        onClick={open}
        size={size}
        variant={variant}
      />
      {itemCount > 0 && (
        <Box
          className="absolute -top-xs -right-xs pointer-events-none"
          aria-live="polite"
        >
          <Badge tone="primary" size="sm">
            {itemCount}
          </Badge>
        </Box>
      )}
    </Box>
  );
}
