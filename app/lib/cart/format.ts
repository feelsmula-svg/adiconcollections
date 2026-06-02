const FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(minorUnits: number): string {
  return FORMATTER.format(minorUnits / 100);
}

export const formatCents = formatPrice;

/** True when a whole-percent discount is set and actually reduces the price. */
export function hasDiscount(discountPercent?: number): boolean {
  return typeof discountPercent === "number" && discountPercent > 0;
}

/**
 * The net price after applying a whole-percent discount, rounded to the nearest
 * cent. Returns `priceCents` unchanged when there is no (positive) discount.
 * Pure — never mutates its inputs.
 */
export function discountedCents(
  priceCents: number,
  discountPercent?: number,
): number {
  if (!hasDiscount(discountPercent)) return priceCents;
  const pct = Math.min(Math.max(discountPercent as number, 0), 100);
  return Math.round(priceCents * (1 - pct / 100));
}

/** Badge text for a discount, e.g. `-10%`. */
export function discountBadgeLabel(discountPercent: number): string {
  return `-${Math.round(discountPercent)}%`;
}
