import { notFound, redirect } from "next/navigation";

import { AdminPage } from "@/app/components/admin/admin-page";
import { CustomerRoleToggle } from "@/app/components/admin/customer-role-toggle";
import {
  Badge,
  Box,
  Card,
  DataTable,
  EmptyState,
  Heading,
  LinkButton,
  Row,
  Stack,
  Text,
  type DataTableColumn,
} from "@/app/components/ui";
import { getSessionUser, toPublicUser } from "@/app/lib/auth/server";
import { getUserRepository } from "@/app/lib/auth/user-repository";
import { getOrderRepository } from "@/app/lib/orders/order-repository";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  formatCurrency,
  formatOrderDate,
} from "@/app/lib/orders/format";
import { isPaidOrder, type OrderRecord } from "@/app/lib/orders/types";

interface AdminCustomerDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

const CUSTOMER_ORDERS_PAGE_SIZE = 8;

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export default async function AdminCustomerDetailPage({
  params,
  searchParams,
}: AdminCustomerDetailPageProps) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    redirect("/account");
  }

  const { id } = await params;
  const search = await searchParams;
  const currentPage = parsePage(search.page);

  const userRepo = await getUserRepository();
  const record = await userRepo.findById(id);
  if (!record) notFound();
  const customer = toPublicUser(record);

  const orderRepo = await getOrderRepository();
  const orders = await orderRepo.list({ userId: id });

  const spend = orders
    .filter((o) => o.status !== "cancelled" && isPaidOrder(o))
    .reduce((sum, o) => sum + o.total, 0);

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
    <AdminPage
      title={customer.name}
      subtitle={customer.email}
    >
      <Row align="center" justify="between" className="flex-wrap gap-md">
        <LinkButton
          href="/admin/customers"
          variant="ghost"
          size="sm"
          caps={false}
        >
          ← Back to customers
        </LinkButton>
      </Row>

      <Row gap="lg" className="flex-wrap items-start">
        <Box className="flex-1 min-w-[280px]">
          <Card variant="outlined" padding="lg" rounded="2xl">
            <Stack gap="md">
              <Heading level={2} variant="headline-sm">
                Profile
              </Heading>
              <Stack gap="xs">
                <Row align="center" gap="sm">
                  <Text variant="label-caps" tone="muted" as="span">
                    Joined
                  </Text>
                  <Text variant="body-md" as="span">
                    {formatOrderDate(customer.createdAt)}
                  </Text>
                </Row>
                <Row align="center" gap="sm">
                  <Text variant="label-caps" tone="muted" as="span">
                    Lifetime spend
                  </Text>
                  <Text variant="body-md" as="span" className="font-semibold">
                    {formatCurrency(spend)}
                  </Text>
                </Row>
                <Row align="center" gap="sm">
                  <Text variant="label-caps" tone="muted" as="span">
                    Orders
                  </Text>
                  <Text variant="body-md" as="span">
                    {orders.length}
                  </Text>
                </Row>
              </Stack>
              <CustomerRoleToggle
                userId={customer.id}
                currentRole={customer.role}
                selfUserId={session.id}
              />
            </Stack>
          </Card>
        </Box>

        <Box className="flex-[2] min-w-[320px]">
          <Card variant="outlined" padding="none" rounded="2xl">
            <Box className="px-lg py-md border-b border-outline-variant">
              <Heading level={2} variant="headline-sm">
                Order history
              </Heading>
            </Box>
            <DataTable
              columns={columns}
              rows={orders}
              rowKey={(order) => order.id}
              pagination={{
                pageSize: CUSTOMER_ORDERS_PAGE_SIZE,
                currentPage,
                buildHref: (page) =>
                  page > 1
                    ? `/admin/customers/${id}?page=${page}`
                    : `/admin/customers/${id}`,
              }}
              emptyState={
                <EmptyState
                  title="No orders yet"
                  description="When this customer places an order, it will appear here."
                />
              }
            />
          </Card>
        </Box>
      </Row>
    </AdminPage>
  );
}
