export type OrderStatus =
  | "processing"
  | "in-transit"
  | "delivered"
  | "cancelled";

export interface OrderSummary {
  id: string;
  reference: string;
  placedAt: string;
  status: OrderStatus;
  total: number;
  productName: string;
  expectedDelivery?: string;
  imageUrl?: string;
}

const MOCK_ORDERS: OrderSummary[] = [
  {
    id: "AD-98421",
    reference: "#AD-98421",
    placedAt: "2024-10-12",
    status: "processing",
    total: 124.0,
    productName: "Silk Infusion Bundle",
  },
  {
    id: "AD-97210",
    reference: "#AD-97210",
    placedAt: "2024-09-28",
    status: "delivered",
    total: 86.5,
    productName: "Body Wave 18\" Bundle",
  },
  {
    id: "AD-95112",
    reference: "#AD-95112",
    placedAt: "2024-08-15",
    status: "delivered",
    total: 210.0,
    productName: "Closure Trio Set",
  },
  {
    id: "AD-92001",
    reference: "#AD-92001",
    placedAt: "2024-07-02",
    status: "cancelled",
    total: 45.0,
    productName: "Bone Straight 12\"",
  },
];

const ACTIVE_SHIPMENT: OrderSummary = {
  id: "AC-92834",
  reference: "#AC-92834",
  placedAt: "2024-10-16",
  status: "in-transit",
  total: 248.0,
  productName: "Silk Infusion Set",
  expectedDelivery: "2024-10-24",
};

export async function listOrders(): Promise<OrderSummary[]> {
  return MOCK_ORDERS;
}

export async function getActiveShipment(): Promise<OrderSummary | null> {
  return ACTIVE_SHIPMENT;
}

export function formatOrderDate(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}
