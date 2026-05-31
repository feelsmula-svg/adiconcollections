import { Box } from "./Box";
import { Stack } from "./Stack";
import { Skeleton } from "./Skeleton";
import { cn } from "./cn";

/**
 * Placeholder that mirrors `products/product-card.tsx`: a 4/5 image block with a
 * centred title and price line beneath. Swaps seamlessly for the real card.
 */
export function ProductCardSkeleton() {
  return (
    <Stack gap="sm" className="h-full">
      <Skeleton className="aspect-product w-full" />
      <Stack gap="xs" align="center" className="pt-xs">
        <Skeleton className="h-3 w-3/5" rounded="full" />
        <Skeleton className="h-3 w-2/5" rounded="full" />
      </Stack>
    </Stack>
  );
}

type GridVariant = "featured" | "collection";

const GRID: Record<GridVariant, string> = {
  // Matches product-grid.tsx
  featured: "grid grid-cols-2 md:grid-cols-4 gap-xl",
  // Matches collection-content.tsx
  collection: "grid grid-cols-2 lg:grid-cols-4 gap-md",
};

interface ProductGridSkeletonProps {
  count?: number;
  variant?: GridVariant;
  className?: string;
}

/** A full grid of product card skeletons in the real storefront layout. */
export function ProductGridSkeleton({
  count = 8,
  variant = "featured",
  className,
}: ProductGridSkeletonProps) {
  return (
    <Box className={cn(GRID[variant], className)}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </Box>
  );
}
