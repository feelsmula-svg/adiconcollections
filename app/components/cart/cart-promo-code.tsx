"use client";

import { useState, useTransition, type KeyboardEvent } from "react";

import { useCartStore } from "@/app/lib/state/cart-store";
import { validatePromoCode } from "@/app/lib/campaigns/actions";
import {
  Box,
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
  const applyPromo = useCartStore((state) => state.applyPromo);
  const clearPromo = useCartStore((state) => state.clearPromo);
  const appliedPromo = useCartStore((state) => state.appliedPromo);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const applyCode = () => {
    const value = code.trim().toUpperCase();
    if (value.length === 0) return;
    setError(null);
    startTransition(async () => {
      const result = await validatePromoCode(value);
      if (!result.ok || !result.campaign || !result.campaign.discount) {
        setError(result.error ?? "That code isn't valid.");
        return;
      }
      const discount = result.campaign.discount;
      const label =
        discount.type === "percent"
          ? `${discount.value}% off`
          : discount.type === "fixed"
            ? `$${(discount.value / 100).toFixed(2)} off`
            : "Free shipping";
      applyPromo({
        code: value,
        campaignId: result.campaign.id,
        type: discount.type,
        value: discount.value,
        minSubtotalCents: discount.minSubtotalCents,
        label,
      });
    });
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
      {appliedPromo ? (
        <Box className="rounded-lg border border-primary/30 bg-primary-fixed/40 p-sm">
          <Row justify="between" align="center" gap="sm" wrap>
            <Stack gap="none">
              <Text variant="body-sm" as="span" className="font-semibold">
                {appliedPromo.code}
              </Text>
              <Text variant="body-sm" tone="muted" as="span" className="text-[11px]">
                {appliedPromo.label} applied
              </Text>
            </Stack>
            <Button
              variant="ghost"
              size="sm"
              caps={false}
              onClick={() => {
                clearPromo();
                setError(null);
              }}
            >
              Remove
            </Button>
          </Row>
        </Box>
      ) : (
        <>
          <Row gap="xs">
            <TextField
              placeholder="Enter code"
              value={code}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              onKeyDown={onKeyDown}
              aria-label="Promo code"
              disabled={pending}
              className="text-body-sm py-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={applyCode}
              disabled={pending}
              className="shrink-0 tracking-[0.1em]"
            >
              {pending ? "Checking…" : "Apply"}
            </Button>
          </Row>
          {error ? (
            <Text variant="body-sm" tone="error" className="text-[11px]">
              {error}
            </Text>
          ) : null}
        </>
      )}
    </Stack>
  );
}
