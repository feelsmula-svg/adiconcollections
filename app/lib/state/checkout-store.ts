"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DeliveryMethod } from "@/app/lib/cart/constants";

export interface ShippingFields {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  stateRegion: string;
  zip: string;
  phone: string;
}

interface CheckoutState extends ShippingFields {
  delivery: DeliveryMethod;

  setField: <K extends keyof ShippingFields>(
    key: K,
    value: ShippingFields[K],
  ) => void;
  setDelivery: (value: DeliveryMethod) => void;
  reset: () => void;
}

const INITIAL_FIELDS: ShippingFields = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  stateRegion: "",
  zip: "",
  phone: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      ...INITIAL_FIELDS,
      delivery: "same-day",

      setField: (key, value) => set({ [key]: value } as Partial<CheckoutState>),
      setDelivery: (value) => set({ delivery: value }),
      reset: () => set({ ...INITIAL_FIELDS, delivery: "same-day" }),
    }),
    {
      name: "adicon.checkout.v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useIsCheckoutValid(): boolean {
  return useCheckoutStore((state) => {
    if (!EMAIL_REGEX.test(state.email)) return false;
    const required: Array<keyof ShippingFields> = [
      "firstName",
      "lastName",
      "address",
      "city",
      "stateRegion",
      "zip",
      "phone",
    ];
    if (required.some((key) => state[key].trim().length === 0)) return false;
    const phoneDigits = state.phone.replace(/\D+/g, "");
    if (phoneDigits.length < 7) return false;
    return true;
  });
}
