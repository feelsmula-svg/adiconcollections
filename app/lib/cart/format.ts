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
