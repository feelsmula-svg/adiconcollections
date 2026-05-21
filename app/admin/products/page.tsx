import { redirect } from "next/navigation";

import { AdminShell } from "@/app/components/admin/admin-shell";
import {
  Badge,
  Card,
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
import { formatCurrency } from "@/app/lib/orders/format";
import { getProductRepository } from "@/app/lib/products/product-repository";
import {
  DEFAULT_SEED_STOCK,
  seedProductMetas,
} from "@/app/lib/products/seed-stock";
import { getSeedStockRepository } from "@/app/lib/products/seed-stock-repository";
import type { ProductCategory } from "@/app/lib/products/types";
import { getCategoryRepository } from "@/app/lib/taxonomy/category-repository";
import { resolveCategoryLabel } from "@/app/lib/taxonomy/types";

interface CatalogRow {
  id: string;
  source: "seed" | "admin";
  name: string;
  type: string;
  imageUrl: string;
  priceCents: number;
  category: ProductCategory;
  stock: number;
  featured: boolean;
}

const PRODUCTS_PAGE_SIZE = 10;

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

interface AdminProductsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const params = await searchParams;
  const currentPage = parsePage(params.page);

  const repo = await getProductRepository();
  const seedRepo = await getSeedStockRepository();
  const categoryRepo = await getCategoryRepository();
  const [admin, seedStockMap, categories] = await Promise.all([
    repo.list(),
    seedRepo.getAll(),
    categoryRepo.list(),
  ]);

  const rows: CatalogRow[] = [
    ...seedProductMetas().map<CatalogRow>((meta) => ({
      id: meta.product.id,
      source: "seed",
      name: meta.product.name,
      type: meta.type,
      imageUrl: meta.product.imageSrc,
      priceCents: meta.product.priceCents,
      category: meta.category,
      stock:
        typeof seedStockMap[meta.product.id] === "number"
          ? seedStockMap[meta.product.id]
          : DEFAULT_SEED_STOCK,
      featured: meta.featured,
    })),
    ...admin.map<CatalogRow>((p) => ({
      id: p.id,
      source: "admin",
      name: p.name,
      type: p.type,
      imageUrl: p.imageUrl,
      priceCents: p.priceCents,
      category: p.category,
      stock: p.stock,
      featured: p.featured,
    })),
  ];

  const columns: DataTableColumn<CatalogRow>[] = [
    {
      key: "image",
      header: "",
      width: "72px",
      mobileLeading: true,
      render: (row) => <ProductThumb src={row.imageUrl} alt={row.name} />,
    },
    {
      key: "name",
      header: "Product",
      mobilePrimary: true,
      render: (row) => (
        <Stack gap="none">
          <Row gap="xs" align="center" className="flex-wrap">
            <Text variant="body-md" as="span" className="font-semibold">
              {row.name}
            </Text>
            {row.source === "seed" ? (
              <Badge tone="neutral">Seed</Badge>
            ) : null}
          </Row>
          <Text variant="body-sm" tone="muted" as="span">
            {row.type}
          </Text>
        </Stack>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (row) => (
        <Badge tone="neutral">
          {resolveCategoryLabel(row.category, categories)}
        </Badge>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      align: "end",
      render: (row) => (
        <Text variant="body-md" as="span" className="font-semibold">
          {row.stock}
        </Text>
      ),
    },
    {
      key: "price",
      header: "Price",
      align: "end",
      render: (row) => (
        <Text variant="body-md" as="span" className="font-semibold">
          {formatCurrency(row.priceCents / 100)}
        </Text>
      ),
    },
    {
      key: "featured",
      header: "Featured",
      render: (row) =>
        row.featured ? (
          <Badge tone="primary">Featured</Badge>
        ) : (
          <Text variant="body-sm" tone="muted" as="span">
            —
          </Text>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      mobileFooter: true,
      render: (row) =>
        row.source === "admin" ? (
          <LinkButton
            href={`/admin/products/${row.id}`}
            variant="outline"
            size="sm"
            caps={false}
          >
            Edit
          </LinkButton>
        ) : (
          <LinkButton
            href={`/products/${row.id}`}
            variant="ghost"
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
      active="products"
      title="Catalog"
      subtitle="Product lifecycle — names, descriptions, pricing, images, and what is featured on the storefront. Manage stock in Inventory."
    >
      <Row align="center" justify="between" className="flex-wrap gap-md">
        <Stack gap="none">
          <Text variant="label-caps" tone="muted" as="span">
            {rows.length} products · {admin.length} editable
          </Text>
          <Text variant="body-sm" tone="muted">
            Seed products ship with the app — their metadata isn&apos;t editable
            here, but you can adjust their stock in Inventory. Uploaded products
            are fully managed.
          </Text>
        </Stack>
        <LinkButton
          href="/admin/products/new"
          variant="primary"
          size="md"
          caps={false}
        >
          + Upload product
        </LinkButton>
      </Row>

      <Card variant="outlined" padding="none" rounded="2xl">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => `${row.source}:${row.id}`}
          pagination={{
            pageSize: PRODUCTS_PAGE_SIZE,
            currentPage,
            buildHref: (page) =>
              page > 1 ? `/admin/products?page=${page}` : "/admin/products",
          }}
          emptyState={
            <EmptyState
              title="No products yet"
              description="Upload your first product to populate the shop."
              action={
                <LinkButton
                  href="/admin/products/new"
                  variant="primary"
                  size="sm"
                  caps={false}
                >
                  Upload product
                </LinkButton>
              }
            />
          }
        />
      </Card>
    </AdminShell>
  );
}
