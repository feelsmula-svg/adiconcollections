"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Badge,
  Box,
  Button,
  Row,
  Stack,
  Text,
  TextField,
} from "@/app/components/ui";
import { stockLabel, stockTone } from "@/app/lib/products/stock";

export type InventorySource = "admin" | "seed";

interface InventoryRowProps {
  productId: string;
  currentStock: number;
  source: InventorySource;
}

function endpointFor(source: InventorySource, productId: string): string {
  return source === "seed"
    ? `/api/admin/seed-stock/${productId}`
    : `/api/admin/products/${productId}`;
}

export function InventoryRow({
  productId,
  currentStock,
  source,
}: InventoryRowProps) {
  const router = useRouter();
  const [value, setValue] = useState<string>(String(currentStock));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(nextValue: number) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(endpointFor(source, productId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: nextValue }),
      });
      const json = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Save failed");
      }
      router.refresh();
    } catch (caught: unknown) {
      const message =
        caught instanceof Error ? caught.message : "Save failed";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  function handleAdd(delta: number) {
    const next = currentStock + delta;
    if (next < 0) return;
    setValue(String(next));
    save(next);
  }

  function handleCommit() {
    const next = Number(value);
    if (!Number.isFinite(next) || next < 0) {
      setError("Enter a non-negative number.");
      setValue(String(currentStock));
      return;
    }
    if (next === currentStock) return;
    save(next);
  }

  return (
    <Stack gap="xs" align="end">
      <Row align="center" gap="sm">
        <Badge tone={stockTone(currentStock)}>{stockLabel(currentStock)}</Badge>
        <Text variant="body-md" as="span" className="font-semibold">
          {currentStock}
        </Text>
      </Row>
      <Row align="center" gap="xs">
        <Button
          variant="outline"
          size="sm"
          caps={false}
          onClick={() => handleAdd(-1)}
          disabled={saving || currentStock <= 0}
        >
          −1
        </Button>
        <Box className="w-[80px]">
          <TextField
            type="number"
            min="0"
            step="1"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onBlur={handleCommit}
            className="text-center"
          />
        </Box>
        <Button
          variant="outline"
          size="sm"
          caps={false}
          onClick={() => handleAdd(1)}
          disabled={saving}
        >
          +1
        </Button>
        <Button
          variant="primary"
          size="sm"
          caps={false}
          onClick={() => handleAdd(10)}
          disabled={saving}
        >
          +10
        </Button>
      </Row>
      {error ? (
        <Text variant="body-sm" tone="error">
          {error}
        </Text>
      ) : null}
    </Stack>
  );
}
