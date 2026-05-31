"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Icon, Text } from "@/app/components/ui";
import { buildInvoicePdf, invoiceFileName } from "@/app/lib/orders/invoice-pdf";
import type { OrderDetail } from "@/app/lib/orders/types";

interface DownloadInvoiceButtonProps {
  order: OrderDetail;
}

export function DownloadInvoiceButton({ order }: DownloadInvoiceButtonProps) {
  const handleDownload = () => {
    const doc = buildInvoicePdf(order);
    doc.save(invoiceFileName(order));
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
