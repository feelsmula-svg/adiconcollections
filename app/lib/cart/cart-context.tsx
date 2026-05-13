"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine, CartProduct } from "./types";

const TAX_RATE = 0.0825;

interface CartContextValue {
  lines: CartLine[];
  isOpen: boolean;
  itemCount: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  initialLines?: CartLine[];
  children: ReactNode;
}

export function CartProvider({
  initialLines = [],
  children,
}: CartProviderProps) {
  const [lines, setLines] = useState<CartLine[]>(initialLines);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const addItem = useCallback((product: CartProduct, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((line) => line.product.id === product.id);
      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setLines((prev) => prev.filter((line) => line.product.id !== id));
  }, []);

  const setQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id);
        return;
      }
      setLines((prev) =>
        prev.map((line) =>
          line.product.id === id ? { ...line, quantity } : line,
        ),
      );
    },
    [removeItem],
  );

  const clear = useCallback(() => {
    setLines([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotalCents = lines.reduce(
      (sum, line) => sum + line.product.priceCents * line.quantity,
      0,
    );
    const taxCents = Math.round(subtotalCents * TAX_RATE);
    const totalCents = subtotalCents + taxCents;

    return {
      lines,
      isOpen,
      itemCount,
      subtotalCents,
      taxCents,
      totalCents,
      open,
      close,
      toggle,
      addItem,
      removeItem,
      setQuantity,
      clear,
    };
  }, [
    lines,
    isOpen,
    open,
    close,
    toggle,
    addItem,
    removeItem,
    setQuantity,
    clear,
  ]);

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
