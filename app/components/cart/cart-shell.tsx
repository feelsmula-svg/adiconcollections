"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/app/lib/cart/cart-context";
import { CartDrawer } from "./cart-drawer";

interface CartShellProps {
  children: ReactNode;
}

export function CartShell({ children }: CartShellProps) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
