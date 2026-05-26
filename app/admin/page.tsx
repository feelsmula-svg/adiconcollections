import { redirect } from "next/navigation";

import { AdminShell } from "@/app/components/admin/admin-shell";
import {
  Badge,
  BarChart,
  Box,
  Card,
  ChipRail,
  Heading,
  Icon,
  LinkButton,
  ProductThumb,
  Row,
  Stack,
  Text,
  cn,
  type BarChartDatum,
} from "@/app/components/ui";
import { getSessionUser } from "@/app/lib/auth/server";
import { getUserRepository } from "@/app/lib/auth/user-repository";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  formatCurrency,
  formatOrderDate,
} from "@/app/lib/orders/format";
import { getOrderRepository } from "@/app/lib/orders/order-repository";
import type { OrderRecord } from "@/app/lib/orders/types";
import { recentAdminPrompts } from "@/app/lib/orders/system-prompts";
import { SystemPromptFeed } from "@/app/components/orders/system-prompt-feed";
import { getProductRepository } from "@/app/lib/products/product-repository";
import {
  DEFAULT_SEED_STOCK,
  seedProductMetas,
} from "@/app/lib/products/seed-stock";
import { STOCK_CRITICAL, STOCK_LOW } from "@/app/lib/products/stock";
import { getSeedStockRepository } from "@/app/lib/products/seed-stock-repository";

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const [orderRepo, productRepo, userRepo, seedStockRepo] = await Promise.all([
    getOrderRepository(),
    getProductRepository(),
    getUserRepository(),
    getSeedStockRepository(),
  ]);
  const [orders, adminProducts, users, seedStockMap] = await Promise.all([
    orderRepo.list(),
    productRepo.list(),
    userRepo.list(),
    seedStockRepo.getAll(),
  ]);

  const activeOrders = orders.filter(
    (o) => o.status === "processing" || o.status === "in-transit",
  );
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const aov =
    orders.length > 0 ? revenue / Math.max(1, orders.length) : 0;
  const customerCount = users.filter((u) => u.role === "customer").length;

  const recent = orders.slice(0, 5);
  const salesTrend = computeWeeklyRevenue(orders, 12);
  const adminUpdates = recentAdminPrompts(orders, 6);
  interface CatalogItem {
    id: string;
    name: string;
    stock: number;
    imageUrl: string;
    priceCents: number;
  }
  const catalogItems: CatalogItem[] = [
    ...adminProducts.map((p) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      imageUrl: p.imageUrl,
      priceCents: p.priceCents,
    })),
    ...seedProductMetas().map((meta) => ({
      id: meta.product.id,
      name: meta.product.name,
      stock:
        typeof seedStockMap[meta.product.id] === "number"
          ? seedStockMap[meta.product.id]
          : DEFAULT_SEED_STOCK,
      imageUrl: meta.product.imageSrc,
      priceCents: meta.product.priceCents,
    })),
  ];
  const lowStock = catalogItems
    .filter((p) => p.stock < STOCK_LOW)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 4);
  const topProducts = catalogItems.slice(0, 4);

  return (
    <AdminShell
      user={user}
      active="dashboard"
      title="Dashboard Overview"
      subtitle="Welcome back to your command center."
    >
      <Row gap="sm" justify="end" className="flex-wrap">
        <LinkButton
          href="/admin/products/new"
          variant="primary"
          size="sm"
          caps={false}
        >
          + Upload product
        </LinkButton>
        <LinkButton
          href="/admin/orders"
          variant="outline"
          size="sm"
          caps={false}
        >
          Open orders
        </LinkButton>
      </Row>

      <Box className="grid grid-cols-2 xl:grid-cols-4 gap-sm sm:gap-md lg:gap-lg">
        <KpiCard
          icon="payments"
          iconTone="primary"
          label="Total Revenue"
          value={formatCurrency(revenue)}
          delta="+12.5%"
          deltaTone="secondary"
        />
        <KpiCard
          icon="shopping_cart"
          iconTone="secondary"
          label="Active Orders"
          value={String(activeOrders.length)}
          delta={`${activeOrders.length} open`}
          deltaTone="secondary"
        />
        <KpiCard
          icon="group_add"
          iconTone="tertiary"
          label="Customers"
          value={String(customerCount)}
          delta="+4%"
          deltaTone="secondary"
        />
        <KpiCard
          icon="insights"
          iconTone="neutral"
          label="Avg. Order Value"
          value={formatCurrency(aov)}
          delta="Stable"
          deltaTone="muted"
        />
      </Box>

      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <Card
          variant="outlined"
          padding="lg"
          rounded="2xl"
          className="lg:col-span-2"
        >
          <Stack gap="lg">
            <Row align="center" justify="between" className="flex-wrap gap-md">
              <Heading level={2} variant="headline-sm">
                Sales Analytics
              </Heading>
              <Row gap="xs">
                <Badge tone="neutral">30 Days</Badge>
                <Text variant="body-sm" tone="muted">
                  90 Days
                </Text>
              </Row>
            </Row>
            <Box className="w-full rounded-xl bg-surface-container-low border border-outline-variant p-md">
              <BarChart
                data={salesTrend}
                height={260}
                ariaLabel="Weekly revenue for the last 12 weeks"
                valueFormatter={shortCurrency}
              />
            </Box>
            <Text variant="body-sm" tone="muted">
              Weekly gross revenue (excluding cancelled orders) for the last 12
              weeks, computed directly from your order history.
            </Text>
          </Stack>
        </Card>

        <Card variant="tonal" padding="lg" rounded="2xl">
          <Stack gap="md">
            <Row align="center" gap="sm">
              <Icon name="warning" className="text-error" />
              <Heading level={2} variant="headline-sm">
                Inventory Alerts
              </Heading>
            </Row>
            {lowStock.length === 0 ? (
              <Text variant="body-sm" tone="muted">
                Stock levels look healthy across the catalog.
              </Text>
            ) : (
              <ChipRail
                ariaLabel="Inventory alerts"
                alwaysScroll
                className="-mx-lg px-lg"
              >
                {lowStock.map((product) => {
                  const critical = product.stock < STOCK_CRITICAL;
                  return (
                    <Card
                      key={product.id}
                      variant="outlined"
                      padding="md"
                      rounded="lg"
                      className={cn(
                        "w-[220px]",
                        critical && "border-error-container",
                      )}
                    >
                      <Stack gap="xs">
                        <Badge tone={critical ? "error" : "secondary"} size="sm">
                          {critical ? "Critical low stock" : "Low stock"}
                        </Badge>
                        <Text
                          variant="body-md"
                          as="span"
                          className="font-semibold truncate"
                        >
                          {product.name}
                        </Text>
                        <Text variant="body-sm" tone="muted">
                          {product.stock} units left
                        </Text>
                      </Stack>
                    </Card>
                  );
                })}
              </ChipRail>
            )}
            <LinkButton
              href="/admin/inventory"
              variant="outline"
              size="sm"
              caps={false}
              fullWidth
            >
              Open inventory
            </LinkButton>
          </Stack>
        </Card>
      </Box>

      <SystemPromptFeed
        title="Latest activity"
        emptyMessage="No order activity yet. Actions you take on orders will appear here."
        prompts={adminUpdates}
        showOrderReference
        showActor
        hrefBuilder={(prompt) => `/admin/orders/${prompt.orderId}`}
      />

      <Box className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
        <Card
          variant="outlined"
          padding="none"
          rounded="2xl"
          className="xl:col-span-2 overflow-hidden"
        >
          <Box className="px-lg py-md border-b border-outline-variant flex items-center justify-between">
            <Heading level={2} variant="headline-sm">
              Recent Orders
            </Heading>
            <LinkButton href="/admin/orders" variant="ghost" size="sm" caps={false}>
              View all
            </LinkButton>
          </Box>
          <Stack gap="none">
            {recent.length === 0 ? (
              <Box className="px-lg py-2xl">
                <Text variant="body-sm" tone="muted">
                  No orders yet.
                </Text>
              </Box>
            ) : (
              recent.map((order) => (
                <Box
                  key={order.id}
                  className="px-lg py-md border-b border-outline-variant last:border-b-0"
                >
                  <Stack gap="sm" className="md:flex-row md:items-center md:justify-between md:gap-md">
                    <Row gap="sm" align="center" justify="between" className="md:flex-1 md:min-w-0">
                      <Stack gap="none" className="min-w-0">
                        <Text variant="body-md" as="span" className="font-semibold truncate">
                          {order.reference}
                        </Text>
                        <Text variant="body-sm" tone="muted" as="span" className="truncate">
                          {order.customerName}
                        </Text>
                      </Stack>
                      <Badge tone={ORDER_STATUS_TONE[order.status]}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </Badge>
                    </Row>
                    <Row gap="md" align="center" justify="between" className="md:justify-end md:shrink-0">
                      <Stack gap="none" className="md:items-end">
                        <Text variant="body-sm" tone="muted" as="span">
                          {formatOrderDate(order.placedAt)}
                        </Text>
                        <Text variant="body-md" as="span" className="font-semibold">
                          {formatCurrency(order.total)}
                        </Text>
                      </Stack>
                      <LinkButton
                        href={`/admin/orders/${order.id}`}
                        variant="outline"
                        size="sm"
                        caps={false}
                      >
                        Open
                      </LinkButton>
                    </Row>
                  </Stack>
                </Box>
              ))
            )}
          </Stack>
        </Card>

        <Card variant="outlined" padding="none" rounded="2xl">
          <Box className="px-lg py-md border-b border-outline-variant">
            <Heading level={2} variant="headline-sm">
              Top Products
            </Heading>
          </Box>
          <Stack gap="md" className="p-lg">
            {topProducts.length === 0 ? (
              <Text variant="body-sm" tone="muted">
                Upload products to populate this list.
              </Text>
            ) : (
              topProducts.map((product) => (
                <Row key={product.id} align="center" gap="md">
                  <ProductThumb src={product.imageUrl} alt={product.name} />
                  <Stack gap="none" className="flex-1 min-w-0">
                    <Text
                      variant="body-md"
                      as="span"
                      className="font-semibold truncate"
                    >
                      {product.name}
                    </Text>
                    <Text variant="body-sm" tone="muted" as="span">
                      {product.stock} in stock
                    </Text>
                  </Stack>
                  <Text variant="body-md" as="span" className="font-semibold">
                    {formatCurrency(product.priceCents)}
                  </Text>
                </Row>
              ))
            )}
            <LinkButton
              href="/admin/products"
              variant="outline"
              size="sm"
              caps={false}
              fullWidth
            >
              Manage catalog
            </LinkButton>
          </Stack>
        </Card>
      </Box>
    </AdminShell>
  );
}

interface KpiCardProps {
  icon: string;
  iconTone: "primary" | "secondary" | "tertiary" | "neutral";
  label: string;
  value: string;
  delta: string;
  deltaTone: "secondary" | "muted";
}

const ICON_TONE: Record<KpiCardProps["iconTone"], string> = {
  primary: "bg-primary-fixed text-primary",
  secondary: "bg-secondary-fixed text-secondary",
  tertiary: "bg-tertiary-fixed text-tertiary",
  neutral: "bg-surface-container-high text-on-surface",
};

const WEEK_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function computeWeeklyRevenue(
  orders: OrderRecord[],
  weeks: number,
): BarChartDatum[] {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const totals = new Array<number>(weeks).fill(0);

  for (const order of orders) {
    if (order.status === "cancelled") continue;
    const placed = new Date(order.placedAt).getTime();
    if (Number.isNaN(placed)) continue;
    const weeksAgo = Math.floor((now - placed) / msPerWeek);
    if (weeksAgo < 0 || weeksAgo >= weeks) continue;
    const index = weeks - 1 - weeksAgo;
    totals[index] += order.total;
  }

  return totals.map((value, index) => {
    const weeksAgo = weeks - 1 - index;
    const weekStart = new Date(now - weeksAgo * msPerWeek);
    return {
      label: WEEK_LABEL_FORMATTER.format(weekStart),
      value,
    };
  });
}

function shortCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  if (value <= 0) return "$0";
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function KpiCard({ icon, iconTone, label, value, delta, deltaTone }: KpiCardProps) {
  return (
    <Card variant="outlined" padding="md" rounded="2xl" className="lg:p-lg">
      <Stack gap="sm" className="lg:gap-md">
        <Row align="center" justify="between" gap="xs">
          <Box className={`${ICON_TONE[iconTone]} p-xs rounded-lg shrink-0`}>
            <Icon name={icon} />
          </Box>
          <Text
            variant="label-caps"
            tone={deltaTone === "muted" ? "muted" : "secondary"}
            as="span"
            className="truncate text-right"
          >
            {delta}
          </Text>
        </Row>
        <Stack gap="xs">
          <Text variant="label-caps" tone="muted" as="span" className="truncate">
            {label}
          </Text>
          <Heading
            level={3}
            variant="headline-sm"
            className="lg:text-headline-md truncate"
          >
            {value}
          </Heading>
        </Stack>
      </Stack>
    </Card>
  );
}
