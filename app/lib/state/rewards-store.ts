"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface RedeemedReward {
  id: string;
  code: string;
  label: string;
  points: number;
  redeemedAt: string;
}

interface RewardsState {
  balance: number;
  redeemed: RedeemedReward[];
  redeem: (label: string, points: number) => RedeemedReward | null;
}

function newCode(): string {
  return `ADC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      balance: 450,
      redeemed: [],
      redeem: (label, points) => {
        const balance = get().balance;
        if (balance < points) return null;
        const reward: RedeemedReward = {
          id: `r_${Math.random().toString(36).slice(2, 10)}`,
          code: newCode(),
          label,
          points,
          redeemedAt: new Date().toISOString(),
        };
        set((state) => ({
          balance: state.balance - points,
          redeemed: [reward, ...state.redeemed],
        }));
        return reward;
      },
    }),
    {
      name: "adicon.rewards.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        balance: state.balance,
        redeemed: state.redeemed,
      }),
    },
  ),
);
