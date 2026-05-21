"use client";

import { useMemo, useState } from "react";

import {
  Badge,
  Box,
  Button,
  Card,
  DataTable,
  type DataTableColumn,
  Heading,
  Icon,
  Pagination,
  Row,
  Select,
  Stack,
  Text,
  TextLink,
} from "@/app/components/ui";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  formatCurrency,
  formatOrderDate,
} from "@/app/lib/orders/format";
import type { OrderSummary } from "@/app/lib/orders/types";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "processing", label: "Processing" },
  { value: "in-transit", label: "In transit" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportCsv(orders: OrderSummary[]) {
  const header = ["Reference", "Product", "Placed", "Status", "Total"];
  const rows = orders.map((order) =>
    [
      order.reference,
      order.productName,
      formatOrderDate(order.placedAt),
      ORDER_STATUS_LABEL[order.status],
      formatCurrency(order.total),
    ]
      .map(csvEscape)
      .join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `adicon-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface OrdersListProps {
  orders: OrderSummary[];
}

const ORDERS_LIST_PAGE_SIZE = 8;

export function OrdersList({ orders }: OrdersListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  function handleStatusChange(next: string) {
    setStatusFilter(next);
    setPage(1);
  }

  const pageStart = (page - 1) * ORDERS_LIST_PAGE_SIZE;
  const pageEnd = pageStart + ORDERS_LIST_PAGE_SIZE;
  const pageRows = filtered.slice(pageStart, pageEnd);

  const columns: DataTableColumn<OrderSummary>[] = [
    {
      key: "id",
      header: "Order",
      render: (order) => (
        <Stack gap="none">
          <Text variant="body-md" className="font-semibold" as="span">
            {order.reference}
          </Text>
          <Text variant="body-sm" tone="muted" as="span">
            {order.productName}
          </Text>
        </Stack>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (order) => (
        <Text variant="body-sm" tone="muted" as="span">
          {formatOrderDate(order.placedAt)}
        </Text>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order) => (
        <Badge tone={ORDER_STATUS_TONE[order.status]} size="sm">
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (order) => (
        <Text variant="body-md" as="span" className="font-semibold">
          {formatCurrency(order.total)}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (order) => (
        <TextLink href={`/account/orders/${order.id}`} variant="default">
          Details →
        </TextLink>
      ),
    },
  ];

  return (
    <Card variant="outlined" padding="none" rounded="2xl">
      <Box className="px-lg py-md md:px-xl md:py-lg border-b border-outline-variant">
        <Row justify="between" align="center" gap="sm" wrap>
          <Stack gap="none" className="min-w-0">
            <Heading level={2} variant="headline-sm" size="body-lg">
              All Orders
            </Heading>
            <Text variant="body-sm" tone="muted">
              {filtered.length} of {orders.length} order
              {orders.length === 1 ? "" : "s"} shown
            </Text>
          </Stack>
          <Row gap="xs" align="center" className="shrink-0">
            <Select
              options={STATUS_FILTERS}
              value={statusFilter}
              onChange={(event) => handleStatusChange(event.target.value)}
              aria-label="Filter orders by status"
              className="bg-surface-container-low border border-outline-variant rounded-full font-body-md text-body-sm tracking-normal px-md py-xs"
              bare
            />
            <Button
              variant="ghost"
              size="sm"
              caps={false}
              className="rounded-full gap-xs"
              aria-label="Export orders as CSV"
              onClick={() => exportCsv(filtered)}
              disabled={filtered.length === 0}
            >
              <Icon name="download" className="text-lg" />
              <Text as="span" variant="body-sm" className="hidden sm:inline">
                Export
              </Text>
            </Button>
          </Row>
        </Row>
      </Box>

      {filtered.length === 0 ? (
        <Box className="p-2xl">
          <Stack gap="sm" align="center">
            <Icon name="receipt_long" className="text-primary text-3xl" />
            <Heading level={3} variant="headline-sm">
              No orders match this filter
            </Heading>
            <Text variant="body-md" tone="muted" align="center">
              Try a different status, or clear the filter to see everything.
            </Text>
            <Button
              variant="primary"
              size="sm"
              caps={false}
              className="rounded-full"
              onClick={() => handleStatusChange("all")}
            >
              Clear filter
            </Button>
          </Stack>
        </Box>
      ) : (
        <>
          <Box className="hidden md:block">
            <DataTable
              columns={columns}
              rows={pageRows}
              rowKey={(order) => order.id}
              caption="Order history"
            />
          </Box>
          <Stack
            gap="none"
            className="md:hidden divide-y divide-outline-variant"
          >
            {pageRows.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </Stack>
          <Pagination
            totalRows={filtered.length}
            pagination={{
              pageSize: ORDERS_LIST_PAGE_SIZE,
              currentPage: page,
              onPageChange: setPage,
            }}
          />
        </>
      )}
    </Card>
  );
}

interface OrderRowProps {
  order: OrderSummary;
}

function OrderRow({ order }: OrderRowProps) {
  return (
    <Box className="px-lg py-md">
      <Stack gap="sm">
        <Row justify="between" align="center" gap="sm">
          <Stack gap="none" className="min-w-0 flex-1">
            <Text
              variant="body-md"
              className="font-semibold truncate"
              as="span"
            >
              {order.reference}
            </Text>
            <Text variant="body-sm" tone="muted" className="truncate" as="span">
              {order.productName}
            </Text>
          </Stack>
          <Badge tone={ORDER_STATUS_TONE[order.status]} size="sm">
            {ORDER_STATUS_LABEL[order.status]}
          </Badge>
        </Row>
        <Row justify="between" align="center" gap="sm">
          <Text variant="body-sm" tone="muted" as="span">
            {formatOrderDate(order.placedAt)}
          </Text>
          <Row gap="md" align="center">
            <Text variant="body-md" as="span" className="font-semibold">
              {formatCurrency(order.total)}
            </Text>
            <TextLink
              href={`/account/orders/${order.id}`}
              variant="default"
            >
              Details →
            </TextLink>
          </Row>
        </Row>
      </Stack>
    </Box>
  );
}
