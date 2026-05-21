"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Address {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  phone?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export type AddressInput = Omit<Address, "id">;

interface AddressState {
  addresses: Address[];
  add: (input: AddressInput) => string;
  update: (id: string, input: AddressInput) => void;
  remove: (id: string) => void;
}

const SEED: Address[] = [
  {
    id: "seed-shipping",
    name: "John Joe",
    line1: "1248 Editorial Way, Suite 400",
    city: "New York",
    state: "NY",
    postal: "10012",
    country: "United States",
    isDefaultShipping: true,
  },
  {
    id: "seed-billing",
    name: "John Joe",
    line1: "1248 Editorial Way, Suite 400",
    city: "New York",
    state: "NY",
    postal: "10012",
    country: "United States",
    isDefaultBilling: true,
  },
];

function newId(): string {
  return `addr_${Math.random().toString(36).slice(2, 10)}`;
}

function clearOtherFlags(
  list: Address[],
  exceptId: string | null,
  field: "isDefaultShipping" | "isDefaultBilling",
): Address[] {
  return list.map((entry) =>
    entry.id === exceptId ? entry : { ...entry, [field]: false },
  );
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      addresses: SEED,
      add: (input) => {
        const id = newId();
        set((state) => {
          let next: Address[] = [...state.addresses, { id, ...input }];
          if (input.isDefaultShipping)
            next = clearOtherFlags(next, id, "isDefaultShipping");
          if (input.isDefaultBilling)
            next = clearOtherFlags(next, id, "isDefaultBilling");
          return { addresses: next };
        });
        return id;
      },
      update: (id, input) =>
        set((state) => {
          let next = state.addresses.map((entry) =>
            entry.id === id ? { id, ...input } : entry,
          );
          if (input.isDefaultShipping)
            next = clearOtherFlags(next, id, "isDefaultShipping");
          if (input.isDefaultBilling)
            next = clearOtherFlags(next, id, "isDefaultBilling");
          return { addresses: next };
        }),
      remove: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((entry) => entry.id !== id),
        })),
    }),
    {
      name: "adicon.addresses.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ addresses: state.addresses }),
    },
  ),
);
