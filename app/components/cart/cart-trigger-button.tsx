"use client";

import { useCart } from "@/app/lib/cart/cart-context";
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
  const { open, itemCount } = useCart();
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
        <Box className="absolute -top-xs -right-xs pointer-events-none">
          <Badge tone="primary" size="sm">
            {itemCount}
          </Badge>
        </Box>
      )}
    </Box>
  );
}
