"use client";

import { create } from "zustand";

import type { PublicUser } from "@/app/lib/auth/types";
import type {
  SigninInput,
  SignupInput,
} from "@/app/lib/auth/schemas";

export type AuthStatus = "idle" | "loading" | "authed" | "guest";

export type FieldErrors = Record<string, string[] | undefined>;

export interface AuthActionFailure {
  ok: false;
  error: string;
  fieldErrors?: FieldErrors;
}

export interface AuthActionSuccess {
  ok: true;
  user: PublicUser;
}

export type AuthActionResult = AuthActionSuccess | AuthActionFailure;

interface AuthState {
  user: PublicUser | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
  signIn: (input: SigninInput) => Promise<AuthActionResult>;
  signUp: (input: SignupInput) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
}

interface SessionResponse {
  user: PublicUser | null;
}

interface AuthErrorResponse {
  error?: string;
  fieldErrors?: FieldErrors;
  user?: PublicUser;
}

const GENERIC_ERROR = "Something went wrong. Please try again.";

async function postJson(
  url: string,
  body: unknown,
): Promise<{ status: number; data: AuthErrorResponse | null }> {
  const res = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  let data: AuthErrorResponse | null = null;
  try {
    data = (await res.json()) as AuthErrorResponse;
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: "idle",

  refresh: async () => {
    set({ status: "loading" });
    try {
      const res = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) {
        set({ user: null, status: "guest" });
        return;
      }
      const data = (await res.json()) as SessionResponse;
      if (data.user) {
        set({ user: data.user, status: "authed" });
      } else {
        set({ user: null, status: "guest" });
      }
    } catch {
      set({ user: null, status: "guest" });
    }
  },

  signIn: async (input) => {
    set({ status: "loading" });
    const { status, data } = await postJson("/api/auth/signin", input);
    if (status === 200 && data?.user) {
      set({ user: data.user, status: "authed" });
      return { ok: true, user: data.user };
    }
    set((state) => ({
      ...state,
      status: state.user ? "authed" : "guest",
    }));
    return {
      ok: false,
      error: data?.error ?? GENERIC_ERROR,
      fieldErrors: data?.fieldErrors,
    };
  },

  signUp: async (input) => {
    set({ status: "loading" });
    const { status, data } = await postJson("/api/auth/signup", input);
    if (status === 200 && data?.user) {
      set({ user: data.user, status: "authed" });
      return { ok: true, user: data.user };
    }
    set((state) => ({
      ...state,
      status: state.user ? "authed" : "guest",
    }));
    return {
      ok: false,
      error: data?.error ?? GENERIC_ERROR,
      fieldErrors: data?.fieldErrors,
    };
  },

  signOut: async () => {
    set({ status: "loading" });
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      // ignore network errors — we still clear local state
    }
    set({ user: null, status: "guest" });
  },
}));
