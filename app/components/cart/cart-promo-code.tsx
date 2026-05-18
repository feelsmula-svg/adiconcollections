"use client";

import { type KeyboardEvent } from "react";
import { useCartStore } from "@/app/lib/state/cart-store";
import {
  Button,
  Icon,
  Row,
  Stack,
  Text,
  TextField,
} from "@/app/components/ui";

export function CartPromoCode() {
  const code = useCartStore((state) => state.promoCode);
  const setPromoCode = useCartStore((state) => state.setPromoCode);

  const applyCode = () => {
    if (!code.trim()) return;
    // TODO: wire to promo API
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyCode();
    }
  };

  return (
    <Stack gap="xs">
      <Row gap="xs" align="center">
        <Icon name="redeem" className="text-primary text-base" />
        <Text variant="label-caps" className="text-[11px]">
          Promo code
        </Text>
      </Row>
      <Row gap="xs">
        <TextField
          placeholder="Enter code"
          value={code}
          onChange={(e) => setPromoCode(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Promo code"
          className="text-body-sm py-xs"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={applyCode}
          className="shrink-0 tracking-[0.1em]"
        >
          Apply
        </Button>
      </Row>
    </Stack>
  );
}
