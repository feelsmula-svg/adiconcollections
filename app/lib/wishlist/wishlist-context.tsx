"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import { toggleWishlist } from "./actions";

interface WishlistContextValue {
  ids: ReadonlySet<string>;
  isAuthenticated: boolean;
  pending: boolean;
  toggle: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

interface WishlistProviderProps {
  initialIds: string[];
  isAuthenticated: boolean;
  children: ReactNode;
}

export function WishlistProvider({
  initialIds,
  isAuthenticated,
  children,
}: WishlistProviderProps) {
  const [ids, setIds] = useState<ReadonlySet<string>>(
    () => new Set(initialIds),
  );
  const [pending, startTransition] = useTransition();

  const toggle = useCallback(
    (productId: string) => {
      if (!isAuthenticated) return;
      const next = new Set(ids);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      setIds(next);
      startTransition(async () => {
        const result = await toggleWishlist(productId);
        if (result.ok) {
          setIds(new Set(result.ids));
        }
      });
    },
    [ids, isAuthenticated],
  );

  const isWishlisted = useCallback(
    (productId: string) => ids.has(productId),
    [ids],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({ ids, isAuthenticated, pending, toggle, isWishlisted }),
    [ids, isAuthenticated, pending, toggle, isWishlisted],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    return {
      ids: new Set<string>(),
      isAuthenticated: false,
      pending: false,
      toggle: () => {},
      isWishlisted: () => false,
    };
  }
  return ctx;
}
