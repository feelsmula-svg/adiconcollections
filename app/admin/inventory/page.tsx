import { redirect } from "next/navigation";

import { AdminShell } from "@/app/components/admin/admin-shell";
import {
  InventoryRow,
  type InventorySource,
} from "@/app/components/admin/inventory-row";
import { InventorySearch } from "@/app/components/admin/inventory-search";
import {
  Badge,
  Box,
  Card,
  ChipRail,
  DataTable,
  EmptyState,
  LinkButton,
  ProductThumb,
  Row,
  Stack,
  Text,
  type DataTableColumn,
} from "@/app/components/ui";
import { getSessionUser } from "@/app/lib/auth/server";
import { getProductRepository } from "@/app/lib/products/product-repository";
import {
  DEFAULT_SEED_STOCK,
  seedProductMetas,
} from "@/app/lib/products/seed-stock";
import { getSeedStockRepository } from "@/app/lib/products/seed-stock-repository";
import { STOCK_CRITICAL, STOCK_LOW } from "@/app/lib/products/stock";
import type { ProductCategory } from "@/app/lib/products/types";
import { getCategoryRepository } from "@/app/lib/taxonomy/category-repository";
import { resolveCategoryLabel } from "@/app/lib/taxonomy/types";

const TABS = ["attention", "critical", "low", "all"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABEL: Record<Tab, string> = {
  attention: "Needs attention",
  critical: "Critical",
  low: "Low",
  all: "All stock",
};

interface InventoryItem {
  id: string;
  source: InventorySource;
  name: string;
  type: string;
  imageUrl: string;
  category: ProductCategory;
  stock: number;
}

function isTab(value: string | undefined): value is Tab {
  return !!value && (TABS as readonly string[]).includes(value);
}

function tabMatches(tab: Tab, stock: number): boolean {
  if (tab === "all") return true;
  if (tab === "critical") return stock < STOCK_CRITICAL;
  if (tab === "low") return stock >= STOCK_CRITICAL && stock < STOCK_LOW;
  return stock < STOCK_LOW;
}

function matchesQuery(item: InventoryItem, query: string): boolean {
  if (query.length === 0) return true;
  const haystack = `${item.name} ${item.type}`.toLowerCase();
  return haystack.includes(query);
}

interface AdminInventoryPageProps {
  searchParams: Promise<{ tab?: string; q?: string; page?: string }>;
}

const INVENTORY_PAGE_SIZE = 12;

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export default async function AdminInventoryPage({
  searchParams,
}: AdminInventoryPageProps) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const params = await searchParams;
  const tab: Tab = isTab(params.tab) ? params.tab : "attention";
  const query = (params.q?.trim() ?? "").toLowerCase();
  const currentPage = parsePage(params.page);

  const repo = await getProductRepository();
  const seedRepo = await getSeedStockRepository();
  const categoryRepo = await getCategoryRepository();
  const [adminProducts, seedStockMap, categories] = await Promise.all([
    repo.list(),
    seedRepo.getAll(),
    categoryRepo.list(),
  ]);

  const seedItems: InventoryItem[] = seedProductMetas().map((meta) => ({
    id: meta.product.id,
    source: "seed",
    name: meta.product.name,
    type: meta.type,
    imageUrl: meta.product.imageSrc,
    category: meta.category,
    stock:
      typeof seedStockMap[meta.product.id] === "number"
        ? seedStockMap[meta.product.id]
        : DEFAULT_SEED_STOCK,
  }));

  const adminItems: InventoryItem[] = adminProducts.map((product) => ({
    id: product.id,
    source: "admin",
    name: product.name,
    type: product.type,
    imageUrl: product.imageUrl,
    category: product.category,
    stock: product.stock,
  }));

  const items: InventoryItem[] = [...seedItems, ...adminItems];

  const critical = items.filter((p) => p.stock < STOCK_CRITICAL).length;
  const low = items.filter(
    (p) => p.stock >= STOCK_CRITICAL && p.stock < STOCK_LOW,
  ).length;
  const healthy = items.length - critical - low;

  const rows = items
    .filter((item) => tabMatches(tab, item.stock))
    .filter((item) => matchesQuery(item, query))
    .sort((a, b) => a.stock - b.stock);

  const columns: DataTableColumn<InventoryItem>[] = [
    {
      key: "image",
      header: "",
      width: "72px",
      mobileLeading: true,
      render: (item) => <ProductThumb src={item.imageUrl} alt={item.name} />,
    },
    {
      key: "name",
      header: "Product",
      mobilePrimary: true,
      render: (item) => (
        <Stack gap="none">
          <Row gap="xs" align="center" className="flex-wrap">
            <Text variant="body-md" as="span" className="font-semibold">
              {item.name}
            </Text>
            {item.source === "seed" ? (
              <Badge tone="neutral">Seed</Badge>
            ) : null}
          </Row>
          <Text variant="body-sm" tone="muted" as="span">
            {item.type}
          </Text>
        </Stack>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item) => (
        <Badge tone="neutral">
          {resolveCategoryLabel(item.category, categories)}
        </Badge>
      ),
    },
    {
      key: "stock",
      header: "Stock control",
      align: "end",
      mobileFooter: true,
      render: (item) => (
        <InventoryRow
          productId={item.id}
          currentStock={item.stock}
          source={item.source}
        />
      ),
    },
  ];

  return (
    <AdminShell
      user={user}
      active="inventory"
      title="Inventory"
      subtitle="Stock health and restocking across every product on the storefront. Edit product info in Catalog."
    >
      <Box className="grid grid-cols-3 gap-sm sm:gap-md lg:gap-lg">
        <SummaryCard
          label={`Critical (< ${STOCK_CRITICAL})`}
          value={critical}
          tone="error"
        />
        <SummaryCard label={`Low (< ${STOCK_LOW})`} value={low} tone="secondary" />
        <SummaryCard label="Healthy" value={healthy} tone="primary" />
      </Box>

      <Card variant="outlined" padding="md" rounded="2xl">
        <Stack gap="md">
          <ChipRail ariaLabel="Filter inventory by stock health">
            {TABS.map((value) => (
              <TabLink
                key={value}
                active={tab === value}
                label={TAB_LABEL[value]}
                href={buildHref({ tab: value, q: query })}
                count={
                  value === "critical"
                    ? critical
                    : value === "low"
                      ? low
                      : value === "attention"
                        ? critical + low
                        : items.length
                }
              />
            ))}
          </ChipRail>
          <InventorySearch initialQuery={query} tab={tab} />
        </Stack>
      </Card>

      <Card variant="outlined" padding="none" rounded="2xl">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(item) => `${item.source}:${item.id}`}
          pagination={{
            pageSize: INVENTORY_PAGE_SIZE,
            currentPage,
            buildHref: (page) => buildHref({ tab, q: query, page }),
          }}
          emptyState={
            <EmptyState
              title={
                tab === "attention" && critical + low === 0
                  ? "Nothing needs restocking right now"
                  : "No products match this filter"
              }
              description={
                tab === "attention"
                  ? "Healthy stock across the catalog. Switch to All to view everything."
                  : "Try a different tab or search term."
              }
              action={
                items.length === 0 ? (
                  <LinkButton
                    href="/admin/products/new"
                    variant="primary"
                    size="sm"
                    caps={false}
                  >
                    Upload product
                  </LinkButton>
                ) : null
              }
            />
          }
        />
      </Card>
    </AdminShell>
  );
}

function buildHref({
  tab,
  q,
  page,
}: {
  tab: Tab;
  q: string;
  page?: number;
}): string {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (q) params.set("q", q);
  if (page && page > 1) params.set("page", String(page));
  return `/admin/inventory?${params.toString()}`;
}

interface TabLinkProps {
  active: boolean;
  label: string;
  href: string;
  count: number;
}

function TabLink({ active, label, href, count }: TabLinkProps) {
  return (
    <LinkButton
      href={href}
      variant={active ? "primary" : "ghost"}
      size="sm"
      caps={false}
    >
      {label} · {count}
    </LinkButton>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  tone: "primary" | "secondary" | "error";
}

const SUMMARY_DOT_TONE: Record<SummaryCardProps["tone"], string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  error: "bg-error",
};

function SummaryCard({ label, value, tone }: SummaryCardProps) {
  const shortLabel = label.replace(/\s*\(.*\)\s*$/, "");
  return (
    <Card variant="outlined" padding="md" rounded="2xl" className="sm:p-lg">
      <Stack gap="xs">
        <Row gap="xs" align="center" className="min-w-0">
          <span
            aria-hidden
            className={`shrink-0 h-[8px] w-[8px] rounded-full ${SUMMARY_DOT_TONE[tone]}`}
          />
          <Text
            variant="label-caps"
            tone="muted"
            as="span"
            className="truncate"
          >
            <span className="sm:hidden">{shortLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </Text>
        </Row>
        <Text
          variant="body-lg"
          as="span"
          className="font-headline-md text-headline-sm sm:text-headline-md"
        >
          {value}
        </Text>
      </Stack>
    </Card>
  );
}
