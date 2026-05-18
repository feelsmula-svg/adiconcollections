"use client";

import type { ReactNode } from "react";
import { CartDrawer } from "./cart-drawer";

interface CartShellProps {
  children: ReactNode;
}

export function CartShell({ children }: CartShellProps) {
  return (
    <>
      {children}
      <CartDrawer />
    </>
  );
}
