import { redirect } from "next/navigation";

import { AdminShell } from "@/app/components/admin/admin-shell";
import {
  Badge,
  Card,
  DataTable,
  EmptyState,
  LinkButton,
  Stack,
  Text,
  type DataTableColumn,
} from "@/app/components/ui";
import { getSessionUser, toPublicUser } from "@/app/lib/auth/server";
import { getUserRepository } from "@/app/lib/auth/user-repository";
import type { PublicUser } from "@/app/lib/auth/types";
import { getOrderRepository } from "@/app/lib/orders/order-repository";
import { formatOrderDate } from "@/app/lib/orders/format";

interface CustomerRow extends PublicUser {
  orderCount: number;
}

const CUSTOMERS_PAGE_SIZE = 10;

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

interface AdminCustomersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminCustomersPage({
  searchParams,
}: AdminCustomersPageProps) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const params = await searchParams;
  const currentPage = parsePage(params.page);

  const userRepo = await getUserRepository();
  const orderRepo = await getOrderRepository();
  const [users, orders] = await Promise.all([userRepo.list(), orderRepo.list()]);

  const orderCountByUser = new Map<string, number>();
  for (const order of orders) {
    orderCountByUser.set(
      order.userId,
      (orderCountByUser.get(order.userId) ?? 0) + 1,
    );
  }

  const rows: CustomerRow[] = users
    .map((record) => ({
      ...toPublicUser(record),
      orderCount: orderCountByUser.get(record.id) ?? 0,
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const columns: DataTableColumn<CustomerRow>[] = [
    {
      key: "name",
      header: "Customer",
      mobilePrimary: true,
      render: (row) => (
        <Stack gap="none">
          <Text variant="body-md" as="span" className="font-semibold">
            {row.name}
          </Text>
          <Text variant="body-sm" tone="muted" as="span" className="truncate">
            {row.email}
          </Text>
        </Stack>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <Badge tone={row.role === "admin" ? "primary" : "neutral"}>
          {row.role === "admin" ? "Admin" : "Customer"}
        </Badge>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      align: "end",
      render: (row) => (
        <Text variant="body-md" as="span" className="font-semibold">
          {row.orderCount}
        </Text>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      render: (row) => (
        <Text variant="body-sm" tone="muted" as="span">
          {formatOrderDate(row.createdAt)}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      mobileFooter: true,
      render: (row) => (
        <LinkButton
          href={`/admin/customers/${row.id}`}
          variant="outline"
          size="sm"
          caps={false}
        >
          View
        </LinkButton>
      ),
    },
  ];

  return (
    <AdminShell
      user={user}
      active="customers"
      title="Customers"
      subtitle="Manage everyone with an Adicon account."
    >
      <Card variant="outlined" padding="none" rounded="2xl">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          pagination={{
            pageSize: CUSTOMERS_PAGE_SIZE,
            currentPage,
            buildHref: (page) =>
              page > 1 ? `/admin/customers?page=${page}` : "/admin/customers",
          }}
          emptyState={
            <EmptyState
              title="No customers yet"
              description="Sign-ups will appear here."
            />
          }
        />
      </Card>
    </AdminShell>
  );
}
