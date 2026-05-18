"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { TAX_RATE } from "@/app/lib/cart/constants";
import type { CartLine, CartProduct } from "@/app/lib/cart/types";

interface CartState {
  lines: CartLine[];
  promoCode: string;
  isOpen: boolean;

  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;

  open: () => void;
  close: () => void;
  toggle: () => void;

  setPromoCode: (code: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      promoCode: "",
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

      clear: () => set({ lines: [], promoCode: "" }),

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      setPromoCode: (code) => set({ promoCode: code }),
    }),
    {
      name: "adicon.cart.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lines: state.lines,
        promoCode: state.promoCode,
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

export function useCartTaxCents(): number {
  const subtotal = useCartSubtotalCents();
  return Math.round(subtotal * TAX_RATE);
}

export function useCartTotalCents(): number {
  return useCartSubtotalCents() + useCartTaxCents();
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
