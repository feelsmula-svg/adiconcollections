"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartLine, CartProduct } from "@/app/lib/cart/types";

export interface AppliedPromo {
  code: string;
  campaignId: string;
  /** `percent`, `fixed`, or `free-shipping`. */
  type: "percent" | "fixed" | "free-shipping";
  /** For percent: 0–100. For fixed: cents. For free-shipping: 0. */
  value: number;
  minSubtotalCents: number;
  /** Short label like "25% off" or "Free shipping" used in the UI. */
  label: string;
}

interface CartState {
  lines: CartLine[];
  promoCode: string;
  appliedPromo: AppliedPromo | null;
  isOpen: boolean;

  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;

  open: () => void;
  close: () => void;
  toggle: () => void;

  setPromoCode: (code: string) => void;
  applyPromo: (promo: AppliedPromo) => void;
  clearPromo: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      promoCode: "",
      appliedPromo: null,
      isOpen: false,

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find(
            (line) => line.product.id === product.id,
          );
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.product.id === product.id
                  ? { ...line, quantity: line.quantity + quantity }
                  : line,
              ),
            };
          }
          return { lines: [...state.lines, { product, quantity }] };
        }),

      removeItem: (id) =>
        set((state) => ({
          lines: state.lines.filter((line) => line.product.id !== id),
        })),

      setQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              lines: state.lines.filter((line) => line.product.id !== id),
            };
          }
          return {
            lines: state.lines.map((line) =>
              line.product.id === id ? { ...line, quantity } : line,
            ),
          };
        }),

      clear: () => set({ lines: [], promoCode: "", appliedPromo: null }),

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      setPromoCode: (code) => set({ promoCode: code }),
      applyPromo: (promo) =>
        set({ appliedPromo: promo, promoCode: promo.code }),
      clearPromo: () => set({ appliedPromo: null, promoCode: "" }),
    }),
    {
      name: "adicon.cart.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lines: state.lines,
        promoCode: state.promoCode,
        appliedPromo: state.appliedPromo,
      }),
    },
  ),
);

export function useCartItemCount(): number {
  return useCartStore((state) =>
    state.lines.reduce((sum, line) => sum + line.quantity, 0),
  );
}

export function useCartSubtotalCents(): number {
  return useCartStore((state) =>
    state.lines.reduce(
      (sum, line) => sum + line.product.priceCents * line.quantity,
      0,
    ),
  );
}

/**
 * Returns the subtotal discount + shipping discount (in cents) that the
 * currently-applied promo grants for the given shippingCents. Returns zeros
 * if there is no promo or the cart no longer meets the minimum.
 */
export function selectAppliedPromoDiscount(
  subtotalCents: number,
  shippingCents: number,
): (state: CartState) => { subtotal: number; shipping: number; label: string } {
  return (state) => {
    const promo = state.appliedPromo;
    if (!promo) return { subtotal: 0, shipping: 0, label: "" };
    if (subtotalCents < promo.minSubtotalCents) {
      return { subtotal: 0, shipping: 0, label: "" };
    }
    if (promo.type === "percent") {
      const percent = Math.max(0, Math.min(100, promo.value));
      return {
        subtotal: Math.min(
          subtotalCents,
          Math.floor((subtotalCents * percent) / 100),
        ),
        shipping: 0,
        label: promo.label,
      };
    }
    if (promo.type === "fixed") {
      return {
        subtotal: Math.min(subtotalCents, Math.max(0, promo.value)),
        shipping: 0,
        label: promo.label,
      };
    }
    // free-shipping
    return {
      subtotal: 0,
      shipping: shippingCents,
      label: promo.label,
    };
  };
}

export function selectIsInCart(productId: string): (state: CartState) => boolean {
  return (state) =>
    state.lines.some(
      (line) =>
        line.product.id === productId ||
        line.product.id.startsWith(`${productId}--`),
    );
}

export function selectCartQuantityFor(
  productId: string,
): (state: CartState) => number {
  return (state) =>
    state.lines
      .filter(
        (line) =>
          line.product.id === productId ||
          line.product.id.startsWith(`${productId}--`),
      )
      .reduce((sum, line) => sum + line.quantity, 0);
}
