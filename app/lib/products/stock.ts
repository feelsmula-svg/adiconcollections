export const STOCK_CRITICAL = 5;
export const STOCK_LOW = 15;

export type StockLevel = "critical" | "low" | "healthy";

export function stockLevel(stock: number): StockLevel {
  if (stock < STOCK_CRITICAL) return "critical";
  if (stock < STOCK_LOW) return "low";
  return "healthy";
}

const TONE: Record<StockLevel, "error" | "secondary" | "primary"> = {
  critical: "error",
  low: "secondary",
  healthy: "primary",
};

const LABEL: Record<StockLevel, string> = {
  critical: "Critical",
  low: "Low",
  healthy: "Healthy",
};

export function stockTone(stock: number): "error" | "secondary" | "primary" {
  return TONE[stockLevel(stock)];
}

export function stockLabel(stock: number): string {
  return LABEL[stockLevel(stock)];
}
