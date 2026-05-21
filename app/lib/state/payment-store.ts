"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  holder: string;
  isPrimary: boolean;
}

export type CardInput = Omit<SavedCard, "id" | "isPrimary">;

interface PaymentState {
  cards: SavedCard[];
  addCard: (input: CardInput) => string;
  makePrimary: (id: string) => void;
  remove: (id: string) => void;
}

const SEED: SavedCard[] = [
  {
    id: "seed-visa",
    brand: "Visa",
    last4: "4429",
    expiry: "08/26",
    holder: "John Joe",
    isPrimary: true,
  },
];

function newId(): string {
  return `card_${Math.random().toString(36).slice(2, 10)}`;
}

function ensurePrimary(cards: SavedCard[]): SavedCard[] {
  if (cards.length === 0) return cards;
  if (cards.some((card) => card.isPrimary)) return cards;
  return cards.map((card, i) => (i === 0 ? { ...card, isPrimary: true } : card));
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      cards: SEED,
      addCard: (input) => {
        const id = newId();
        set((state) => {
          const makePrimary = state.cards.length === 0;
          const next: SavedCard[] = state.cards.map((card) => ({
            ...card,
            isPrimary: makePrimary ? false : card.isPrimary,
          }));
          next.push({ id, ...input, isPrimary: makePrimary });
          return { cards: ensurePrimary(next) };
        });
        return id;
      },
      makePrimary: (id) =>
        set((state) => ({
          cards: state.cards.map((card) => ({
            ...card,
            isPrimary: card.id === id,
          })),
        })),
      remove: (id) =>
        set((state) => {
          const filtered = state.cards.filter((card) => card.id !== id);
          return { cards: ensurePrimary(filtered) };
        }),
    }),
    {
      name: "adicon.payments.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cards: state.cards }),
    },
  ),
);
