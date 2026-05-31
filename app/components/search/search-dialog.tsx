"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

import {
  Badge,
  Box,
  IconButton,
  Image,
  LinkButton,
  Row,
  Spinner,
  Stack,
  Text,
} from "@/app/components/ui";
import { cn } from "@/app/components/ui/cn";
import { formatPrice } from "@/app/lib/cart/format";
import type { CartProduct } from "@/app/lib/cart/types";

const PREVIEW_LIMIT = 4;

function searchProducts(
  query: string,
  catalog: readonly CartProduct[],
): CartProduct[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];
  const tokens = needle.split(/\s+/).filter(Boolean);
  const scored: { product: CartProduct; score: number }[] = [];
  for (const product of catalog) {
    const haystack = `${product.name} ${product.description ?? ""}`.toLowerCase();
    let score = 0;
    for (const token of tokens) {
      if (haystack.includes(token)) score += 1;
      if (product.name.toLowerCase().includes(token)) score += 1;
    }
    if (score > 0) scored.push({ product, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.product);
}

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [catalog, setCatalog] = useState<readonly CartProduct[]>([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load the storefront product catalog the first time the dialog opens.
  // Cached for the lifetime of the dialog so repeated opens don't re-fetch.
  useEffect(() => {
    if (!open || catalogLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { products?: CartProduct[] };
        if (cancelled) return;
        setCatalog(data.products ?? []);
        setCatalogLoaded(true);
      } catch {
        // Leave catalogLoaded=false so a later open retries.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, catalogLoaded]);

  // Lock scroll + focus input when opening; clear query when closing.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebounced("");
    }
  }, [open]);

  // Debounce the query.
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(query), 160);
    return () => clearTimeout(handle);
  }, [query]);

  const results = useMemo(
    () => searchProducts(debounced, catalog),
    [debounced, catalog],
  );
  const preview = results.slice(0, PREVIEW_LIMIT);
  const total = results.length;

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") onClose();
  };

  const onSubmit = () => {
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    onClose();
    router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <Box
      role="dialog"
      aria-modal="true"
      aria-label="Search the collection"
      onKeyDown={onKeyDown}
      className={cn(
        "fixed inset-0 z-[110]",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <Box
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <Box
        className={cn(
          "absolute inset-x-0 top-0 flex justify-center px-md pt-[80px]",
          "transition-all duration-200 ease-out",
          open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
        )}
      >
        <Box className="w-full max-w-[640px] rounded-2xl bg-surface shadow-[0_24px_48px_-12px_rgba(34,18,8,0.22)] overflow-hidden border border-outline-variant">
          <SearchInputRow
            inputRef={inputRef}
            value={query}
            onChange={setQuery}
            onKeyDown={onInputKeyDown}
            onClose={onClose}
            hasQuery={query.trim().length > 0}
            onClear={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          />
          <SearchResults
            query={debounced}
            results={preview}
            total={total}
            loading={!catalogLoaded}
            onNavigate={onClose}
          />
        </Box>
      </Box>
    </Box>,
    document.body,
  );
}

interface SearchInputRowProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>) => void;
  onClose: () => void;
  hasQuery: boolean;
  onClear: () => void;
}

function SearchInputRow({
  inputRef,
  value,
  onChange,
  onKeyDown,
  onClose,
  hasQuery,
  onClear,
}: SearchInputRowProps) {
  return (
    <Row
      gap="sm"
      align="center"
      className="px-md py-sm border-b border-outline-variant"
    >
      <Box className="material-symbols-outlined text-on-surface-variant text-xl">
        search
      </Box>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search wigs, bundles, care…"
        aria-label="Search the collection"
        className="flex-1 bg-transparent border-none focus:outline-none text-body-md py-sm placeholder:text-on-surface-variant placeholder:opacity-70"
      />
      {hasQuery ? (
        <IconButton
          icon="close"
          label="Clear search"
          size="sm"
          variant="plain"
          onClick={onClear}
        />
      ) : null}
      <IconButton
        icon="keyboard_return"
        label="Close search"
        size="sm"
        variant="plain"
        onClick={onClose}
        className="hidden md:inline-flex"
      />
    </Row>
  );
}

interface SearchResultsProps {
  query: string;
  results: CartProduct[];
  total: number;
  loading: boolean;
  onNavigate: () => void;
}

function SearchResults({
  query,
  results,
  total,
  loading,
  onNavigate,
}: SearchResultsProps) {
  const trimmed = query.trim();
  const hasQuery = trimmed.length >= 2;

  // Catalog still downloading while the shopper is already typing.
  if (hasQuery && loading) {
    return (
      <Stack gap="sm" align="center" className="px-md py-lg">
        <Spinner size="md" />
        <Text variant="body-sm" tone="muted">
          Searching the collection…
        </Text>
      </Stack>
    );
  }

  if (!hasQuery) {
    return (
      <Box className="px-md py-lg">
        <Text variant="body-sm" tone="muted">
          Start typing to search the collection — try{" "}
          <Text as="span" variant="body-sm" className="font-semibold">
            bone straight
          </Text>{" "}
          or{" "}
          <Text as="span" variant="body-sm" className="font-semibold">
            jerry curl
          </Text>
          .
        </Text>
      </Box>
    );
  }

  if (results.length === 0) {
    return (
      <Box className="px-md py-lg">
        <Stack gap="xs">
          <Text variant="body-md" className="font-semibold">
            No matches for &ldquo;{trimmed}&rdquo;
          </Text>
          <Text variant="body-sm" tone="muted">
            Try a shorter keyword, or browse the full collection.
          </Text>
          <Box className="pt-xs">
            <LinkButton
              href="/shop"
              variant="ghost"
              size="sm"
              caps={false}
              onClick={onNavigate}
              className="rounded-full px-0"
            >
              Browse shop →
            </LinkButton>
          </Box>
        </Stack>
      </Box>
    );
  }

  return (
    <Stack gap="none">
      <Box className="px-md pt-md pb-sm">
        <Text
          variant="label-caps"
          tone="muted"
          as="span"
          className="tracking-[0.18em]"
        >
          Product Results
        </Text>
      </Box>
      <Stack gap="none" className="divide-y divide-outline-variant">
        {results.map((product) => (
          <SearchResultRow
            key={product.id}
            product={product}
            onNavigate={onNavigate}
          />
        ))}
      </Stack>
      <Box className="border-t border-outline-variant px-md py-md">
        <LinkButton
          href={`/shop?q=${encodeURIComponent(trimmed)}`}
          variant="ghost"
          size="sm"
          caps={false}
          fullWidth
          onClick={onNavigate}
          className="justify-center"
        >
          View all results ({total})
        </LinkButton>
      </Box>
    </Stack>
  );
}

interface SearchResultRowProps {
  product: CartProduct;
  onNavigate: () => void;
}

function SearchResultRow({ product, onNavigate }: SearchResultRowProps) {
  const hasMultipleSizes =
    Array.isArray(product.lengthOptions) && product.lengthOptions.length > 1;

  return (
    <LinkButton
      href={`/products/${product.id}`}
      variant="ghost"
      size="sm"
      caps={false}
      fullWidth
      onClick={onNavigate}
      className="justify-start gap-md px-md py-sm rounded-none"
    >
      <Box className="relative w-14 h-14 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          sizes="56px"
          className="object-cover"
        />
      </Box>
      <Stack gap="none" className="flex-1 min-w-0 text-left">
        <Text
          variant="body-md"
          as="span"
          className="font-semibold truncate"
        >
          {product.name}
        </Text>
        <Row gap="sm" align="center">
          <Text variant="body-sm" as="span" className="font-semibold">
            {formatPrice(product.priceCents)}
          </Text>
          {hasMultipleSizes ? (
            <Badge tone="neutral" size="sm">
              More sizes
            </Badge>
          ) : null}
        </Row>
      </Stack>
    </LinkButton>
  );
}
