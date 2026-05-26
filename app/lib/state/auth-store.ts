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

export interface SignUpPendingResult {
  ok: true;
  pending: true;
  email: string;
  resendInMs: number;
  expiresInMs: number;
}

export type SignUpResult =
  | SignUpPendingResult
  | AuthActionFailure;

export interface VerifyOtpInput {
  email: string;
  code: string;
}

export interface ResendOtpResult {
  ok: true;
  resendInMs: number;
  expiresInMs: number;
}

export type ResendOtpActionResult = ResendOtpResult | AuthActionFailure;

interface AuthState {
  user: PublicUser | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
  signIn: (input: SigninInput) => Promise<AuthActionResult>;
  signUp: (input: SignupInput) => Promise<SignUpResult>;
  verifySignupOtp: (input: VerifyOtpInput) => Promise<AuthActionResult>;
  resendSignupOtp: (email: string) => Promise<ResendOtpActionResult>;
  signOut: () => Promise<void>;
}

interface SessionResponse {
  user: PublicUser | null;
}

interface AuthErrorResponse {
  error?: string;
  fieldErrors?: FieldErrors;
  user?: PublicUser;
  pending?: boolean;
  email?: string;
  resendInMs?: number;
  expiresInMs?: number;
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
    set((state) => ({
      ...state,
      status: state.user ? "authed" : "guest",
    }));
    if (status === 202 && data?.pending && data.email) {
      return {
        ok: true,
        pending: true,
        email: data.email,
        resendInMs: data.resendInMs ?? 0,
        expiresInMs: data.expiresInMs ?? 0,
      };
    }
    return {
      ok: false,
      error: data?.error ?? GENERIC_ERROR,
      fieldErrors: data?.fieldErrors,
    };
  },

  verifySignupOtp: async (input) => {
    set({ status: "loading" });
    const { status, data } = await postJson(
      "/api/auth/signup/verify",
      input,
    );
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

  resendSignupOtp: async (email) => {
    const { status, data } = await postJson("/api/auth/signup/resend", {
      email,
    });
    if (status === 200) {
      return {
        ok: true,
        resendInMs: data?.resendInMs ?? 0,
        expiresInMs: data?.expiresInMs ?? 0,
      };
    }
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
