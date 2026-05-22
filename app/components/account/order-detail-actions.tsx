"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import jsPDF from "jspdf";

import { Button, Icon, Text } from "@/app/components/ui";
import {
  formatCurrency,
  formatOrderDate,
  formatOrderTimestamp,
} from "@/app/lib/orders/format";
import type { OrderDetail } from "@/app/lib/orders/types";

const PAGE_WIDTH = 595; // A4 portrait in points
const PAGE_HEIGHT = 842;
const MARGIN_X = 48;
const MARGIN_Y = 56;

function buildInvoicePdf(order: OrderDetail): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let cursorY = MARGIN_Y;
  const rightX = PAGE_WIDTH - MARGIN_X;
  const contentWidth = PAGE_WIDTH - MARGIN_X * 2;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(108, 47, 0);
  doc.text("AdiCon Collections", MARGIN_X, cursorY);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Premium hair for the modern woman.", MARGIN_X, cursorY + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(34, 24, 18);
  doc.text("INVOICE", rightX, cursorY, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Reference  ${order.reference}`, rightX, cursorY + 14, {
    align: "right",
  });
  doc.text(
    `Placed     ${formatOrderDate(order.placedAt)}`,
    rightX,
    cursorY + 28,
    { align: "right" },
  );

  cursorY += 56;
  drawDivider(doc, cursorY);
  cursorY += 16;

  // Bill / Ship to columns
  const columnWidth = (contentWidth - 24) / 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text("BILLED TO", MARGIN_X, cursorY);
  doc.text("SHIPPED TO", MARGIN_X + columnWidth + 24, cursorY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(34, 24, 18);
  cursorY += 16;
  doc.text(order.customerName, MARGIN_X, cursorY);
  doc.text(order.shippingAddress.name, MARGIN_X + columnWidth + 24, cursorY);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  cursorY += 14;
  doc.text(order.customerEmail, MARGIN_X, cursorY);
  doc.text(order.shippingAddress.line1, MARGIN_X + columnWidth + 24, cursorY);

  if (order.shippingAddress.line2) {
    cursorY += 14;
    doc.text("", MARGIN_X, cursorY);
    doc.text(order.shippingAddress.line2, MARGIN_X + columnWidth + 24, cursorY);
  }
  cursorY += 14;
  doc.text(
    `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postal}`,
    MARGIN_X + columnWidth + 24,
    cursorY,
  );
  cursorY += 14;
  doc.text(order.shippingAddress.country, MARGIN_X + columnWidth + 24, cursorY);

  cursorY += 24;
  drawDivider(doc, cursorY);
  cursorY += 18;

  // Items table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text("ITEM", MARGIN_X, cursorY);
  doc.text("QTY", MARGIN_X + 320, cursorY, { align: "right" });
  doc.text("PRICE", MARGIN_X + 400, cursorY, { align: "right" });
  doc.text("LINE TOTAL", rightX, cursorY, { align: "right" });
  cursorY += 8;
  drawDivider(doc, cursorY);
  cursorY += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(34, 24, 18);
  order.items.forEach((item) => {
    doc.setFont("helvetica", "bold");
    doc.text(wrapText(item.name, 48), MARGIN_X, cursorY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    if (item.attributes) {
      doc.text(wrapText(item.attributes, 60), MARGIN_X, cursorY + 12);
    }
    doc.setFontSize(11);
    doc.setTextColor(34, 24, 18);
    doc.text(String(item.quantity), MARGIN_X + 320, cursorY, {
      align: "right",
    });
    doc.text(formatCurrency(item.price), MARGIN_X + 400, cursorY, {
      align: "right",
    });
    doc.text(
      formatCurrency(item.price * item.quantity),
      rightX,
      cursorY,
      { align: "right" },
    );
    cursorY += item.attributes ? 28 : 18;
  });

  cursorY += 10;
  drawDivider(doc, cursorY);
  cursorY += 18;

  // Totals
  const labelX = MARGIN_X + 320;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text("Subtotal", labelX, cursorY);
  doc.text(formatCurrency(order.totals.subtotal), rightX, cursorY, {
    align: "right",
  });
  cursorY += 16;
  doc.text("Shipping", labelX, cursorY);
  doc.text(
    order.totals.shipping === 0
      ? "Free"
      : formatCurrency(order.totals.shipping),
    rightX,
    cursorY,
    { align: "right" },
  );
  cursorY += 16;
  doc.text("Tax", labelX, cursorY);
  doc.text(formatCurrency(order.totals.tax), rightX, cursorY, {
    align: "right",
  });
  cursorY += 14;
  drawDivider(doc, cursorY, labelX);
  cursorY += 16;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(108, 47, 0);
  doc.text("Total", labelX, cursorY);
  doc.text(formatCurrency(order.totals.total), rightX, cursorY, {
    align: "right",
  });

  cursorY += 28;
  drawDivider(doc, cursorY);
  cursorY += 18;

  // Payment + tracking
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text("PAYMENT", MARGIN_X, cursorY);
  doc.text("TRACKING", MARGIN_X + columnWidth + 24, cursorY);
  cursorY += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(34, 24, 18);
  doc.text(
    `${order.payment.brand} · ${order.payment.last4}${order.payment.expiry ? ` · Expires ${order.payment.expiry}` : ""}`,
    MARGIN_X,
    cursorY,
  );

  let trackingY = cursorY;
  doc.setFontSize(10);
  order.tracking.forEach((step) => {
    const marker =
      step.status === "complete"
        ? "✓"
        : step.status === "current"
          ? "•"
          : "○";
    const ts = step.timestamp
      ? ` — ${formatOrderTimestamp(step.timestamp)}`
      : "";
    doc.text(
      `${marker} ${step.label}${ts}`,
      MARGIN_X + columnWidth + 24,
      trackingY,
    );
    trackingY += 14;
  });

  // Footer
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Thank you for shopping AdiCon Collections.",
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 40,
    { align: "center" },
  );

  return doc;
}

function drawDivider(doc: jsPDF, y: number, startX = MARGIN_X) {
  doc.setDrawColor(220, 210, 200);
  doc.setLineWidth(0.5);
  doc.line(startX, y, PAGE_WIDTH - MARGIN_X, y);
}

function wrapText(input: string, max: number): string {
  if (input.length <= max) return input;
  return `${input.slice(0, max - 1)}…`;
}

interface DownloadInvoiceButtonProps {
  order: OrderDetail;
}

export function DownloadInvoiceButton({ order }: DownloadInvoiceButtonProps) {
  const handleDownload = () => {
    const doc = buildInvoicePdf(order);
    doc.save(`invoice-${order.reference.replace(/[^A-Za-z0-9-]+/g, "")}.pdf`);
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
