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
  /**
   * Optional whole-percent discount (1–95) on `priceCents` / each length
   * variant. `0` or `undefined` means no discount. Once an item is added to the
   * bag its `priceCents` is already the net price, so cart lines never carry a
   * discount marker.
   */
  discountPercent?: number;
  imageSrc: string;
  imageAlt: string;
  /** Optional full gallery; first entry equals `imageSrc`. */
  images?: string[];
  badge?: ProductBadge;
  lengthOptions?: ProductLengthOption[];
}

export interface CartLine {
  product: CartProduct;
  quantity: number;
}
