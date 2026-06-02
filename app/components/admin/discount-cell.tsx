"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge, Box, Row, Stack, Text, TextField } from "@/app/components/ui";
import {
  discountBadgeLabel,
  discountedCents,
  formatPrice,
  hasDiscount,
} from "@/app/lib/cart/format";

const MAX_DISCOUNT = 95;

interface DiscountCellProps {
  productId: string;
  /** Base price in cents, used to preview the resulting sale price. */
  priceCents: number;
  /** Currently saved discount percent (0 = none). */
  currentDiscount: number;
}

export function DiscountCell({
  productId,
  priceCents,
  currentDiscount,
}: DiscountCellProps) {
  const router = useRouter();
  const [committed, setCommitted] = useState<number>(currentDiscount);
  const [value, setValue] = useState<string>(
    currentDiscount > 0 ? String(currentDiscount) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(nextValue: number) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountPercent: nextValue }),
      });
      const json = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Save failed");
      }
      setCommitted(nextValue);
      router.refresh();
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : "Save failed";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  function handleCommit() {
    const trimmed = value.trim();
    const next = trimmed.length === 0 ? 0 : Math.round(Number(trimmed));
    if (!Number.isFinite(next) || next < 0 || next > MAX_DISCOUNT) {
      setError(`Enter a whole number 0–${MAX_DISCOUNT}.`);
      setValue(committed > 0 ? String(committed) : "");
      return;
    }
    setError(null);
    setValue(next > 0 ? String(next) : "");
    if (next === committed) return;
    save(next);
  }

  return (
    <Stack gap="xs" align="end">
      <Row align="center" gap="xs">
        <Box className="w-[72px]">
          <TextField
            type="number"
            min="0"
            max={String(MAX_DISCOUNT)}
            step="1"
            value={value}
            placeholder="0"
            disabled={saving}
            onChange={(event) => setValue(event.target.value)}
            onBlur={handleCommit}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            className="text-center"
          />
        </Box>
        <Text variant="body-sm" tone="muted" as="span">
          %
        </Text>
      </Row>
      {hasDiscount(committed) ? (
        <Row align="center" gap="xs">
          <Badge tone="primary" size="sm">
            {discountBadgeLabel(committed)}
          </Badge>
          <Text variant="body-sm" tone="primary" as="span" className="font-semibold">
            {formatPrice(discountedCents(priceCents, committed))}
          </Text>
        </Row>
      ) : null}
      {error ? (
        <Text variant="body-sm" tone="error">
          {error}
        </Text>
      ) : null}
    </Stack>
  );
}
