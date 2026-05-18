import { Fragment } from "react";

import { AccountShell } from "@/app/components/account/account-shell";
import {
  Badge,
  Box,
  Button,
  Card,
  DataTable,
  type DataTableColumn,
  Heading,
  Icon,
  Image,
  LinkButton,
  Row,
  Stack,
  Text,
  TextLink,
} from "@/app/components/ui";
import { getSessionUser } from "@/app/lib/auth/server";
import {
  formatCurrency,
  formatOrderDate,
  getActiveShipment,
  listOrders,
  type OrderStatus,
  type OrderSummary,
} from "@/app/lib/account/orders";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrderStatus, string> = {
  processing: "Processing",
  "in-transit": "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<
  OrderStatus,
  "primary" | "secondary" | "neutral" | "error" | "tertiary"
> = {
  processing: "secondary",
  "in-transit": "secondary",
  delivered: "neutral",
  cancelled: "error",
};

const STATUS_INDEX: Record<OrderStatus, number> = {
  processing: 1,
  "in-transit": 2,
  delivered: 3,
  cancelled: -1,
};

const PROGRESS_STEPS: { key: string; label: string }[] = [
  { key: "ordered", label: "Ordered" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export default async function OrderHistoryPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [orders, shipment] = await Promise.all([
    listOrders(),
    getActiveShipment(),
  ]);

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
        <Badge tone={STATUS_TONE[order.status]} size="sm">
          {STATUS_LABEL[order.status]}
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
      render: () => (
        <TextLink href="/account/orders" variant="default">
          Details →
        </TextLink>
      ),
    },
  ];

  return (
    <AccountShell user={user} active="orders">
      <Stack gap="xs">
        <Text
          variant="label-caps"
          tone="primary"
          as="span"
          className="tracking-[0.2em]"
        >
          Member Activity
        </Text>
        <Heading
          level={1}
          variant="display-lg"
          size="headline-md"
          className="md:text-headline-md lg:text-display-lg"
        >
          Order History
        </Heading>
        <Box className="max-w-[560px]">
          <Text variant="body-md" tone="muted">
            Review past purchases, track active shipments, and reorder the
            bundles you love.
          </Text>
        </Box>
      </Stack>

      <Box className="grid grid-cols-1 md:grid-cols-5 gap-md">
        <Card
          variant="outlined"
          padding="none"
          rounded="2xl"
          className="md:col-span-3 overflow-hidden relative"
        >
          <Box className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-tertiary" />
          <Stack gap="none">
            <Row
              gap="md"
              align="center"
              justify="between"
              className="px-lg pt-lg pb-md"
            >
              <Row gap="sm" align="center">
                <Text
                  variant="label-caps"
                  tone="muted"
                  as="span"
                  className="tracking-[0.18em]"
                >
                  Active Shipment
                </Text>
                <Badge tone="secondary" size="sm">
                  {STATUS_LABEL[shipment?.status ?? "in-transit"]}
                </Badge>
              </Row>
              <Text variant="body-sm" tone="muted" as="span">
                {shipment?.reference ?? "—"}
              </Text>
            </Row>
            <Row gap="md" align="center" className="px-lg">
              <Box className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-surface-container-high shrink-0">
                <Image
                  src="/products/bone-straight-ombre-purple-12-a.jpeg"
                  alt={shipment?.productName ?? "Active shipment"}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </Box>
              <Stack gap="xs" className="flex-1 min-w-0">
                <Heading
                  level={2}
                  variant="headline-sm"
                  size="body-lg"
                  className="md:text-headline-sm"
                >
                  {shipment?.productName ?? "No active shipment"}
                </Heading>
                <Text variant="body-sm" tone="muted">
                  Expected{" "}
                  <Text as="span" variant="body-sm" className="font-semibold">
                    {shipment?.expectedDelivery
                      ? formatOrderDate(shipment.expectedDelivery)
                      : "—"}
                  </Text>{" "}
                  · Distribution centre
                </Text>
              </Stack>
            </Row>
            <Box className="px-lg pt-lg">
              <ProgressTimeline status={shipment?.status ?? "in-transit"} />
            </Box>
            <Row gap="sm" wrap className="px-lg py-lg">
              <Button
                variant="primary"
                size="sm"
                caps={false}
                className="rounded-full"
              >
                Track shipment
              </Button>
              <Button
                variant="ghost"
                size="sm"
                caps={false}
                className="rounded-full"
              >
                Contact concierge →
              </Button>
            </Row>
          </Stack>
        </Card>

        <Box className="md:col-span-2 rounded-2xl bg-primary text-on-primary p-lg flex flex-col justify-between gap-md">
          <Stack gap="sm">
            <Row justify="between" align="center">
              <Box className="w-9 h-9 rounded-full bg-on-primary/15 flex items-center justify-center">
                <Icon
                  name="loyalty"
                  filled
                  className="text-on-primary text-lg"
                />
              </Box>
              <Text
                variant="label-caps"
                tone="on-primary"
                as="span"
                className="opacity-70 tracking-[0.18em]"
              >
                Rewards
              </Text>
            </Row>
            <Stack gap="none">
              <Heading
                level={3}
                variant="display-lg"
                tone="on-primary"
                size="headline-md"
                className="md:text-headline-md lg:text-display-lg leading-none"
              >
                450
              </Heading>
              <Text
                variant="body-sm"
                tone="on-primary"
                as="span"
                className="opacity-80"
              >
                points to redeem
              </Text>
            </Stack>
          </Stack>
          <Button
            variant="inverse"
            size="sm"
            fullWidth
            caps={false}
            className="rounded-full"
          >
            Redeem now
          </Button>
        </Box>
      </Box>

      <Card variant="outlined" padding="none" rounded="2xl">
        <Box className="px-lg py-md md:px-xl md:py-lg border-b border-outline-variant">
          <Row justify="between" align="center" gap="sm">
            <Stack gap="none" className="min-w-0">
              <Heading level={2} variant="headline-sm" size="body-lg">
                All Orders
              </Heading>
              <Text variant="body-sm" tone="muted">
                {orders.length} order{orders.length === 1 ? "" : "s"} on record
              </Text>
            </Stack>
            <Row gap="xs" align="center" className="shrink-0">
              <Button
                variant="ghost"
                size="sm"
                caps={false}
                className="rounded-full gap-xs"
                aria-label="Filter orders"
              >
                <Icon name="filter_list" className="text-lg" />
                <Text as="span" variant="body-sm" className="hidden sm:inline">
                  Filter
                </Text>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                caps={false}
                className="rounded-full gap-xs"
                aria-label="Export orders"
              >
                <Icon name="download" className="text-lg" />
                <Text as="span" variant="body-sm" className="hidden sm:inline">
                  Export
                </Text>
              </Button>
            </Row>
          </Row>
        </Box>

        {orders.length === 0 ? (
          <Box className="p-2xl">
            <Stack gap="sm" align="center">
              <Icon name="receipt_long" className="text-primary text-3xl" />
              <Heading level={3} variant="headline-sm">
                No orders yet
              </Heading>
              <Text variant="body-md" tone="muted" align="center">
                Your future purchases will appear here.
              </Text>
              <LinkButton href="/" variant="primary" size="sm">
                Start shopping
              </LinkButton>
            </Stack>
          </Box>
        ) : (
          <>
            <Box className="hidden md:block">
              <DataTable
                columns={columns}
                rows={orders}
                rowKey={(order) => order.id}
                caption="Order history"
              />
            </Box>
            <Stack gap="none" className="md:hidden divide-y divide-outline-variant">
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </Stack>
          </>
        )}

        <Box className="border-t border-outline-variant px-lg py-md flex justify-center">
          <Button variant="ghost" size="sm" caps={false}>
            Load more orders
          </Button>
        </Box>
      </Card>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <Box className="rounded-2xl bg-surface-container p-lg">
          <Stack gap="sm">
            <Icon
              name="format_quote"
              filled
              className="text-tertiary text-2xl"
            />
            <Text variant="body-md" className="italic">
              &ldquo;The Silk Infusion oil transformed my curls in just one
              week. Highly recommend the bundle.&rdquo;
            </Text>
            <Text variant="body-sm" tone="muted">
              — Elena M., Verified Stylist
            </Text>
          </Stack>
        </Box>

        <Card variant="outlined" padding="lg" rounded="2xl">
          <Row gap="md" align="start">
            <Box className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <Icon
                name="support_agent"
                filled
                className="text-on-primary-container text-xl"
              />
            </Box>
            <Stack gap="xs" className="flex-1">
              <Heading level={3} variant="headline-sm" size="body-lg">
                Need help with an order?
              </Heading>
              <Text variant="body-sm" tone="muted">
                Our concierge team is available 24/7 for shipping inquiries or
                product advice.
              </Text>
              <Box className="pt-xs">
                <LinkButton
                  href="/contact"
                  variant="ghost"
                  size="sm"
                  caps={false}
                  className="rounded-full px-0"
                >
                  Contact support →
                </LinkButton>
              </Box>
            </Stack>
          </Row>
        </Card>
      </Box>
    </AccountShell>
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
            <Text variant="body-md" className="font-semibold truncate" as="span">
              {order.reference}
            </Text>
            <Text variant="body-sm" tone="muted" className="truncate" as="span">
              {order.productName}
            </Text>
          </Stack>
          <Badge tone={STATUS_TONE[order.status]} size="sm">
            {STATUS_LABEL[order.status]}
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
            <TextLink href="/account/orders" variant="default">
              Details →
            </TextLink>
          </Row>
        </Row>
      </Stack>
    </Box>
  );
}

interface ProgressTimelineProps {
  status: OrderStatus;
}

function ProgressTimeline({ status }: ProgressTimelineProps) {
  const currentIdx = STATUS_INDEX[status];
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <Row gap="sm" align="center" className="text-error">
        <Icon name="cancel" filled className="text-error text-lg" />
        <Text variant="body-sm" as="span" tone="error">
          Order cancelled
        </Text>
      </Row>
    );
  }

  return (
    <Stack gap="xs" aria-label="Order progress">
      <Row gap="xs" align="center" className="w-full">
        {PROGRESS_STEPS.map((step, i) => {
          const reached = i <= currentIdx;
          const current = i === currentIdx;
          return (
            <Fragment key={step.key}>
              <Box
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  reached ? "bg-primary" : "bg-outline-variant"
                } ${current ? "ring-4 ring-primary/15" : ""}`}
              />
              {i < PROGRESS_STEPS.length - 1 && (
                <Box
                  className={`h-px flex-1 ${
                    i < currentIdx ? "bg-primary" : "bg-outline-variant"
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </Row>
      <Row gap="xs" align="start" justify="between" className="w-full">
        {PROGRESS_STEPS.map((step, i) => (
          <Text
            key={step.key}
            variant="label-caps"
            as="span"
            className={`text-[10px] tracking-[0.12em] ${
              i <= currentIdx
                ? "text-on-surface"
                : "text-on-surface-variant opacity-60"
            }`}
          >
            {step.label}
          </Text>
        ))}
      </Row>
    </Stack>
  );
}

