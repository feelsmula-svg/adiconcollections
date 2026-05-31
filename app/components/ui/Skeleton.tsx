import { cn } from "./cn";

type Rounded = "lg" | "xl" | "2xl" | "full";

const ROUNDED: Record<Rounded, string> = {
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

interface SkeletonProps {
  /** Size/shape utilities (e.g. "h-4 w-24", "aspect-product w-full"). */
  className?: string;
  rounded?: Rounded;
}

/**
 * A single shimmering placeholder block. Compose several of these to mirror the
 * shape of the content that is loading. Decorative only — hidden from a11y.
 */
export function Skeleton({ className, rounded = "lg" }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn("block skeleton-shimmer", ROUNDED[rounded], className)}
    />
  );
}
