import { redirect } from "next/navigation";

import { AdminShell } from "@/app/components/admin/admin-shell";
import {
  Badge,
  Card,
  ChipRail,
  DataTable,
  EmptyState,
  LinkButton,
  Stack,
  Text,
  type DataTableColumn,
} from "@/app/components/ui";
import { getSessionUser } from "@/app/lib/auth/server";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  formatCurrency,
  formatOrderDate,
} from "@/app/lib/orders/format";
import { getOrderRepository } from "@/app/lib/orders/order-repository";
import {
  ORDER_STATUSES,
  type OrderRecord,
  type OrderStatus,
} from "@/app/lib/orders/types";

function isOrderStatus(value: string | undefined): value is OrderStatus {
  return !!value && (ORDER_STATUSES as readonly string[]).includes(value);
}

interface AdminOrdersPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const ORDERS_PAGE_SIZE = 10;

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const params = await searchParams;
  const status = isOrderStatus(params.status) ? params.status : undefined;
  const currentPage = parsePage(params.page);

  const repo = await getOrderRepository();
  const orders = await repo.list(status ? { status } : undefined);

  const buildHref = (page: number): string => {
    const next = new URLSearchParams();
    if (status) next.set("status", status);
    if (page > 1) next.set("page", String(page));
    const query = next.toString();
    return query ? `/admin/orders?${query}` : "/admin/orders";
  };

  const columns: DataTableColumn<OrderRecord>[] = [
    {
      key: "reference",
      header: "Reference",
      mobilePrimary: true,
      render: (order) => (
        <Text variant="body-md" as="span" className="font-semibold">
          {order.reference}
        </Text>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (order) => (
        <Stack gap="none" className="items-end md:items-start">
          <Text variant="body-md" as="span">
            {order.customerName}
          </Text>
          <Text variant="body-sm" tone="muted" as="span" className="truncate">
            {order.customerEmail}
          </Text>
        </Stack>
      ),
    },
    {
      key: "placed",
      header: "Placed",
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
        <Badge tone={ORDER_STATUS_TONE[order.status]}>
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      ),
    },
    {
      key: "total",
      header: "Total",
      align: "end",
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
      mobileFooter: true,
      render: (order) => (
        <LinkButton
          href={`/admin/orders/${order.id}`}
          variant="outline"
          size="sm"
          caps={false}
        >
          Manage
        </LinkButton>
      ),
    },
  ];

  return (
    <AdminShell
      user={user}
      active="orders"
      title="Orders"
      subtitle="Update tracking, change statuses, and oversee fulfilment."
    >
      <Card variant="outlined" padding="md" rounded="2xl">
        <ChipRail ariaLabel="Filter orders by status">
          <StatusFilterLink active={!status} label="All" href="/admin/orders" />
          {ORDER_STATUSES.map((s) => (
            <StatusFilterLink
              key={s}
              active={status === s}
              label={ORDER_STATUS_LABEL[s]}
              href={`/admin/orders?status=${s}`}
            />
          ))}
        </ChipRail>
      </Card>

      <Card variant="outlined" padding="none" rounded="2xl">
        <DataTable
          columns={columns}
          rows={orders}
          rowKey={(order) => order.id}
          pagination={{
            pageSize: ORDERS_PAGE_SIZE,
            currentPage,
            buildHref,
          }}
          emptyState={
            <EmptyState
              title="No orders match this filter"
              description="Try selecting a different status above."
            />
          }
        />
      </Card>
    </AdminShell>
  );
}

interface StatusFilterLinkProps {
  active: boolean;
  label: string;
  href: string;
}

function StatusFilterLink({ active, label, href }: StatusFilterLinkProps) {
  return (
    <LinkButton
      href={href}
      variant={active ? "primary" : "ghost"}
      size="sm"
      caps={false}
    >
      {label}
    </LinkButton>
  );
}
