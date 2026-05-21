"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface ProfileExtras {
  name: string;
  phone: string;
}

interface ProfileState extends ProfileExtras {
  setProfile: (input: Partial<ProfileExtras>) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: "",
      phone: "",
      setProfile: (input) => set((state) => ({ ...state, ...input })),
    }),
    {
      name: "adicon.profile.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ name: state.name, phone: state.phone }),
    },
  ),
);
