"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/app/lib/state/auth-store";
import type { PublicUser } from "@/app/lib/auth/types";
import type { AuthStatus } from "@/app/lib/state/auth-store";

interface UseSessionResult {
  user: PublicUser | null;
  status: AuthStatus;
}

export function useSession(): UseSessionResult {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (useAuthStore.getState().status === "idle") {
      void useAuthStore.getState().refresh();
    }
  }, []);

  return { user, status };
}
