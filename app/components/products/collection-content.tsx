"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Drawer,
  Heading,
  Icon,
  IconButton,
  RangeSlider,
  Row,
  Section,
  Select,
  Stack,
  Text,
  TextLink,
  cn,
} from "@/app/components/ui";
import { ProductCard } from "@/app/components/products/product-card";
import { formatPrice } from "@/app/lib/cart/format";
import type { CartProduct } from "@/app/lib/cart/types";

type LengthBucket = "12-16" | "18-22" | "24-28" | "30+";
type SortKey = "featured" | "price-asc" | "price-desc";

const LENGTHS: Array<{ id: LengthBucket; label: string }> = [
  { id: "12-16", label: '12"-16"' },
  { id: "18-22", label: '18"-22"' },
  { id: "24-28", label: '24"-28"' },
  { id: "30+", label: '30"+' },
];

interface TextureOption {
  id: string;
  label: string;
  keywords: string[];
}

const TEXTURES: TextureOption[] = [
  { id: "straight", label: "Straight", keywords: ["straight"] },
  { id: "curly", label: "Curly", keywords: ["curl", "curly", "curls"] },
  { id: "wavy", label: "Wavy", keywords: ["wave", "wavy"] },
  { id: "bangs", label: "With Bangs", keywords: ["bangs", "fringe"] },
];

const SORT_OPTIONS = [
  { value: "featured", label: "FEATURED" },
  { value: "price-asc", label: "PRICE: LOW TO HIGH" },
  { value: "price-desc", label: "PRICE: HIGH TO LOW" },
];

function extractInches(...sources: Array<string | undefined>): number[] {
  const out: number[] = [];
  for (const source of sources) {
    if (!source) continue;
    const matches = source.matchAll(/(\d+)"/g);
    for (const m of matches) out.push(parseInt(m[1], 10));
  }
  return out;
}

function lengthInBucket(product: CartProduct, bucket: LengthBucket): boolean {
  const lengths = extractInches(product.name, product.description);
  if (lengths.length === 0) return false;
  if (bucket === "30+") return lengths.some((len) => len >= 30);
  const [min, max] = bucket.split("-").map(Number);
  return lengths.some((len) => len >= min && len <= max);
}

function matchesTextures(product: CartProduct, ids: string[]): boolean {
  if (ids.length === 0) return true;
  const haystack = `${product.name} ${product.description ?? ""}`.toLowerCase();
  return ids.some((id) => {
    const option = TEXTURES.find((t) => t.id === id);
    if (!option) return false;
    return option.keywords.some((kw) => haystack.includes(kw));
  });
}

const PAGE_SIZE = 8;

interface CollectionContentProps {
  title: string;
  breadcrumbLabel: string;
  products: CartProduct[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function CollectionContent({
  title,
  breadcrumbLabel,
  products,
  emptyTitle = "No products yet in this collection",
  emptyDescription = "Check back soon — we&apos;re curating new pieces.",
}: CollectionContentProps) {
  const priceCap = Math.max(
    1000,
    ...products.map((p) => Math.ceil(p.priceCents / 100)),
  );

  const searchParams = useSearchParams();
  const urlQuery = (searchParams?.get("q") ?? "").trim();

  const [sort, setSort] = useState<SortKey>("featured");
  const [length, setLength] = useState<LengthBucket | null>(null);
  const [textures, setTextures] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(priceCap);
  const [page, setPage] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(urlQuery);

  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  const activeFilterCount =
    (length ? 1 : 0) +
    textures.length +
    (maxPrice < priceCap ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0);

  const clearFilters = () => {
    setLength(null);
    setTextures([]);
    setMaxPrice(priceCap);
    setSearchQuery("");
  };

  const toggleTexture = (id: string) => {
    setTextures((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const searchTokens = useMemo(
    () =>
      searchQuery
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    [searchQuery],
  );

  const filtered = products.filter((p) => {
    if (p.priceCents > maxPrice * 100) return false;
    if (length && !lengthInBucket(p, length)) return false;
    if (!matchesTextures(p, textures)) return false;
    if (searchTokens.length > 0) {
      const haystack = `${p.name} ${p.description ?? ""}`.toLowerCase();
      if (!searchTokens.every((token) => haystack.includes(token))) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.priceCents - b.priceCents;
    if (sort === "price-desc") return b.priceCents - a.priceCents;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [length, textures, maxPrice, sort, searchQuery]);

  const safePage = Math.min(page, totalPages);
  const visible = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  if (products.length === 0) {
    return (
      <Container width="default">
        <Section padding="md">
          <Stack gap="md">
            <CollectionBreadcrumb label={breadcrumbLabel} />
            <Heading
              level={1}
              variant="display-xl"
              size="headline-md"
              className="leading-tight"
            >
              {title}
            </Heading>
            <Stack gap="md" align="center" justify="center" className="py-3xl">
              <Icon
                name="inventory_2"
                className="text-5xl text-on-surface-variant opacity-60"
              />
              <Heading
                level={3}
                variant="headline-sm"
                size="body-md"
                className="font-bold"
              >
                {emptyTitle}
              </Heading>
              <Text variant="body-sm" tone="muted" align="center">
                {emptyDescription}
              </Text>
            </Stack>
          </Stack>
        </Section>
      </Container>
    );
  }

  return (
    <Container width="default">
      <Section padding="md">
        <Stack gap="xl">
          <CollectionHero
            title={title}
            breadcrumbLabel={breadcrumbLabel}
            sort={sort}
            onSortChange={setSort}
          />
          <Box className="grid grid-cols-1 lg:grid-cols-[14rem_1fr] gap-xl items-start">
            <Box className="hidden lg:block">
              <CollectionFilters
                length={length}
                onLengthChange={setLength}
                textures={textures}
                onToggleTexture={toggleTexture}
                maxPrice={maxPrice}
                priceCap={priceCap}
                onMaxPriceChange={setMaxPrice}
              />
            </Box>
            <Stack gap="md">
              <Row
                justify="between"
                align="center"
                className="lg:hidden"
                gap="sm"
              >
                <Button
                  variant="outline"
                  size="sm"
                  caps={false}
                  className="rounded-full"
                  aria-haspopup="dialog"
                  aria-expanded={filterDrawerOpen}
                  onClick={() => setFilterDrawerOpen(true)}
                >
                  <Icon name="tune" className="text-lg mr-xs" />
                  Filter
                  {activeFilterCount > 0 ? (
                    <Badge
                      tone="primary"
                      size="sm"
                      className="ml-xs"
                    >
                      {activeFilterCount}
                    </Badge>
                  ) : null}
                </Button>
                <Text variant="body-sm" tone="muted">
                  {filtered.length} item
                  {filtered.length === 1 ? "" : "s"}
                </Text>
              </Row>
              {filtered.length === 0 ? (
                <EmptyFiltered onClear={clearFilters} />
              ) : (
                <>
                  <CollectionGrid products={visible} />
                  <CollectionPagination
                    page={safePage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </>
              )}
            </Stack>
          </Box>

          <Drawer
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            anchor="left"
            width="sm"
            ariaLabel="Filter products"
          >
            <Row
              justify="between"
              align="center"
              className="px-lg py-md border-b border-outline-variant bg-surface shrink-0"
            >
              <Heading level={2} variant="headline-sm">
                Filter
              </Heading>
              <IconButton
                icon="close"
                label="Close filters"
                size="sm"
                variant="plain"
                onClick={() => setFilterDrawerOpen(false)}
              />
            </Row>
            <Box className="flex-1 overflow-y-auto bg-surface px-lg py-lg">
              <CollectionFilters
                length={length}
                onLengthChange={setLength}
                textures={textures}
                onToggleTexture={toggleTexture}
                maxPrice={maxPrice}
                priceCap={priceCap}
                onMaxPriceChange={setMaxPrice}
              />
            </Box>
            <Row
              justify="between"
              gap="sm"
              className="px-lg py-md border-t border-outline-variant bg-surface-container-low shrink-0"
            >
              <Button
                variant="ghost"
                size="sm"
                caps={false}
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
              >
                Clear all
              </Button>
              <Button
                variant="primary"
                size="sm"
                caps={false}
                className="rounded-full"
                onClick={() => setFilterDrawerOpen(false)}
              >
                Show {filtered.length} item
                {filtered.length === 1 ? "" : "s"}
              </Button>
            </Row>
          </Drawer>
        </Stack>
      </Section>
    </Container>
  );
}

function CollectionBreadcrumb({ label }: { label: string }) {
  return (
    <Row gap="sm" align="center" wrap>
      <TextLink
        href="/"
        variant="muted"
        className="text-label-caps font-label-caps uppercase"
      >
        Home
      </TextLink>
      <Icon name="chevron_right" className="text-sm text-outline-variant" />
      <Text variant="label-caps" tone="primary">
        {label}
      </Text>
    </Row>
  );
}

interface CollectionHeroProps {
  title: string;
  breadcrumbLabel: string;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}

function CollectionHero({
  title,
  breadcrumbLabel,
  sort,
  onSortChange,
}: CollectionHeroProps) {
  return (
    <Stack gap="md">
      <CollectionBreadcrumb label={breadcrumbLabel} />
      <Row justify="between" align="end" wrap gap="md">
        <Heading
          level={1}
          variant="display-xl"
          size="headline-md"
          className="leading-tight"
        >
          {title}
        </Heading>
        <Row
          gap="sm"
          align="center"
          className="border-b border-outline-variant pb-xs shrink-0"
        >
          <Text variant="label-caps" tone="muted">
            Sort by:
          </Text>
          <Select
            bare
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            options={SORT_OPTIONS}
            aria-label="Sort products"
          />
        </Row>
      </Row>
    </Stack>
  );
}

interface CollectionFiltersProps {
  length: LengthBucket | null;
  onLengthChange: (l: LengthBucket | null) => void;
  textures: string[];
  onToggleTexture: (id: string) => void;
  maxPrice: number;
  priceCap: number;
  onMaxPriceChange: (value: number) => void;
}

function CollectionFilters({
  length,
  onLengthChange,
  textures,
  onToggleTexture,
  maxPrice,
  priceCap,
  onMaxPriceChange,
}: CollectionFiltersProps) {
  return (
    <Stack gap="xl">
      <FilterGroup title="Length">
        <Box className="grid grid-cols-2 gap-sm">
          {LENGTHS.map((opt) => {
            const active = length === opt.id;
            return (
              <Button
                key={opt.id}
                variant={active ? "primary" : "outline"}
                size="sm"
                onClick={() => onLengthChange(active ? null : opt.id)}
                className="tracking-normal"
              >
                {opt.label}
              </Button>
            );
          })}
        </Box>
      </FilterGroup>

      <FilterGroup title="Texture">
        <Stack gap="sm">
          {TEXTURES.map((tex) => (
            <Checkbox
              key={tex.id}
              checked={textures.includes(tex.id)}
              onChange={() => onToggleTexture(tex.id)}
              label={tex.label}
            />
          ))}
        </Stack>
      </FilterGroup>

      <FilterGroup title="Price range">
        <Stack gap="xs">
          <RangeSlider
            min={0}
            max={priceCap}
            step={10}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(Number(e.target.value))}
            aria-label="Maximum price"
          />
          <Row justify="between">
            <Text variant="body-sm" tone="muted">
              $0
            </Text>
            <Text variant="body-sm" tone="primary" className="font-bold">
              Up to {formatPrice(maxPrice * 100)}
            </Text>
          </Row>
        </Stack>
      </FilterGroup>
    </Stack>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Stack gap="sm">
      <Text
        variant="label-caps"
        className="border-b border-outline-variant pb-xs"
      >
        {title}
      </Text>
      {children}
    </Stack>
  );
}

function CollectionGrid({ products }: { products: CartProduct[] }) {
  if (products.length === 0) {
    return (
      <Stack gap="md" align="center" justify="center" className="py-3xl">
        <Icon
          name="search_off"
          className="text-5xl text-on-surface-variant opacity-60"
        />
        <Heading
          level={3}
          variant="headline-sm"
          size="body-md"
          className="font-bold"
        >
          No products match your filters
        </Heading>
        <Text variant="body-sm" tone="muted">
          Try clearing a filter or widening your price range.
        </Text>
      </Stack>
    );
  }

  return (
    <Box className="grid grid-cols-2 lg:grid-cols-4 gap-md">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} withWishlist />
      ))}
    </Box>
  );
}

interface EmptyFilteredProps {
  onClear: () => void;
}

function EmptyFiltered({ onClear }: EmptyFilteredProps) {
  return (
    <Box className="rounded-2xl border border-dashed border-outline-variant p-2xl">
      <Stack gap="sm" align="center" className="text-center">
        <Box className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center">
          <Icon
            name="search_off"
            className="text-on-surface-variant text-2xl"
          />
        </Box>
        <Heading level={3} variant="headline-sm" size="body-lg">
          No products match your filters
        </Heading>
        <Box className="max-w-[360px]">
          <Text variant="body-sm" tone="muted">
            Try clearing a filter or widening your price range to see more
            pieces from the collection.
          </Text>
        </Box>
        <Button
          variant="primary"
          size="sm"
          caps={false}
          className="rounded-full"
          onClick={onClear}
        >
          Clear filters
        </Button>
      </Stack>
    </Box>
  );
}

interface CollectionPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function CollectionPagination({
  page,
  totalPages,
  onPageChange,
}: CollectionPaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <Row gap="md" justify="center" align="center" className="pt-lg">
      <IconButton
        icon="arrow_back_ios"
        label="Previous page"
        variant="plain"
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
      />
      <Row gap="sm" align="center">
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? "primary" : "ghost"}
            size="sm"
            onClick={() => onPageChange(p)}
            className={cn(
              "w-10 h-10 rounded-full px-0 tracking-normal",
              p !== page && "text-on-surface-variant",
            )}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Button>
        ))}
      </Row>
      <IconButton
        icon="arrow_forward_ios"
        label="Next page"
        variant="plain"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      />
    </Row>
  );
}
