"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface WishlistState {
  ids: string[];

  add: (productId: string) => void;
  remove: (productId: string) => void;
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],

      add: (productId) =>
        set((state) =>
          state.ids.includes(productId)
            ? state
            : { ids: [...state.ids, productId] },
        ),

      remove: (productId) =>
        set((state) => ({ ids: state.ids.filter((id) => id !== productId) })),

      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        })),

      has: (productId) => get().ids.includes(productId),

      clear: () => set({ ids: [] }),
    }),
    {
      name: "adicon.wishlist.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ ids: state.ids }),
    },
  ),
);

export function useIsWishlisted(productId: string): boolean {
  return useWishlistStore((state) => state.ids.includes(productId));
}
