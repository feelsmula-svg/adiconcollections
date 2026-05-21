"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Icon, Text } from "@/app/components/ui";
import {
  formatCurrency,
  formatOrderDate,
  formatOrderTimestamp,
} from "@/app/lib/orders/format";
import type { OrderDetail } from "@/app/lib/orders/types";

function buildInvoiceText(order: OrderDetail): string {
  const lines: string[] = [];
  lines.push("ADICON COLLECTIONS · INVOICE");
  lines.push("================================");
  lines.push(`Reference: ${order.reference}`);
  lines.push(`Placed: ${formatOrderDate(order.placedAt)}`);
  lines.push("");
  lines.push("Ship to:");
  lines.push(`  ${order.shippingAddress.name}`);
  lines.push(
    `  ${order.shippingAddress.line1}${order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}`,
  );
  lines.push(
    `  ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postal}`,
  );
  lines.push(`  ${order.shippingAddress.country}`);
  lines.push("");
  lines.push("Items");
  lines.push("--------------------------------");
  order.items.forEach((item) => {
    lines.push(`${item.name} (${item.collection})`);
    lines.push(`  ${item.attributes}`);
    lines.push(
      `  Qty ${item.quantity} · ${formatCurrency(item.price)} each · Line total ${formatCurrency(
        item.price * item.quantity,
      )}`,
    );
  });
  lines.push("");
  lines.push("Summary");
  lines.push("--------------------------------");
  lines.push(`Subtotal:  ${formatCurrency(order.totals.subtotal)}`);
  lines.push(
    `Shipping:  ${order.totals.shipping === 0 ? "Free" : formatCurrency(order.totals.shipping)}`,
  );
  lines.push(`Tax:       ${formatCurrency(order.totals.tax)}`);
  lines.push(`Total:     ${formatCurrency(order.totals.total)}`);
  lines.push("");
  lines.push("Payment");
  lines.push("--------------------------------");
  lines.push(
    `${order.payment.brand} ending in ${order.payment.last4} · Expires ${order.payment.expiry}`,
  );
  lines.push("");
  lines.push("Tracking");
  lines.push("--------------------------------");
  order.tracking.forEach((step) => {
    const marker =
      step.status === "complete"
        ? "[✓]"
        : step.status === "current"
          ? "[•]"
          : "[ ]";
    const ts = step.timestamp ? ` — ${formatOrderTimestamp(step.timestamp)}` : "";
    lines.push(`${marker} ${step.label}${ts}`);
  });
  lines.push("");
  lines.push("Thank you for shopping AdiCon Collections.");
  return lines.join("\n");
}

interface DownloadInvoiceButtonProps {
  order: OrderDetail;
}

export function DownloadInvoiceButton({ order }: DownloadInvoiceButtonProps) {
  const handleDownload = () => {
    const blob = new Blob([buildInvoiceText(order)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="primary"
      size="sm"
      caps={false}
      className="rounded-full"
      onClick={handleDownload}
    >
      <Icon name="download" className="text-lg mr-xs" />
      Download invoice
    </Button>
  );
}

export function RefreshStatusButton() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      caps={false}
      onClick={handleRefresh}
      disabled={refreshing}
    >
      <Icon
        name="refresh"
        className={`text-lg mr-xs ${refreshing ? "animate-spin" : ""}`}
      />
      <Text as="span" variant="body-sm">
        {refreshing ? "Refreshing…" : "Refresh status"}
      </Text>
    </Button>
  );
}
