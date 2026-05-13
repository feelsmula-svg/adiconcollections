export type ProductBadgeTone = "primary" | "secondary";

export interface ProductBadge {
  tone: ProductBadgeTone;
  label: string;
}

export interface ProductLengthOption {
  length: string;
  priceCents: number;
}

export interface CartProduct {
  id: string;
  name: string;
  description?: string;
  priceCents: number;
  imageSrc: string;
  imageAlt: string;
  badge?: ProductBadge;
  lengthOptions?: ProductLengthOption[];
}

export interface CartLine {
  product: CartProduct;
  quantity: number;
}
