"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { api, ApiUser, setAccessToken } from "@/lib/api";

export type AuthUser = ApiUser & {
  name: string;
  initials: string;
};

export function isAdmin(user?: Pick<ApiUser, "role" | "user_role"> | null): boolean {
  return user?.role === "admin" || user?.user_role === 1;
}

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  restoreSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (body: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateProfile: (body: { full_name: string; phone?: string }) => Promise<void>;
  setUserFromApi: (user: ApiUser) => void;
};

let restorePromise: Promise<void> | null = null;

function mapUser(user: ApiUser): AuthUser {
  return {
    ...user,
    name: user.full_name,
    initials: user.full_name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isInitialized: false,
      error: null,

      restoreSession: async () => {
        if (get().isInitialized) return;
        if (restorePromise) return restorePromise;

        restorePromise = api
          .me()
          .then((user) => {
            if (get().isInitialized) return;
            set({ user: mapUser(user), error: null });
          })
          .catch(() => {
            if (get().isInitialized) return;
            setAccessToken(null);
            set({ user: null });
          })
          .finally(() => {
            set({ isLoading: false, isInitialized: true });
            restorePromise = null;
          });

        return restorePromise;
      },

      login: async (email, password) => {
        set({ error: null, isLoading: true });
        try {
          const response = await api.login({ email: email.trim().toLowerCase(), password });
          setAccessToken(response.access_token);
          const user = mapUser(response.user);
          set({ user, isLoading: false, isInitialized: true });
          return user;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : "No pudimos iniciar sesión." });
          throw error;
        }
      },

      register: async (body) => {
        set({ error: null, isLoading: true });
        try {
          const response = await api.register({
            full_name: body.name,
            email: body.email.trim().toLowerCase(),
            password: body.password,
            phone: body.phone,
          });
          setAccessToken(response.access_token);
          const user = mapUser(response.user);
          set({ user, isLoading: false, isInitialized: true });
          return user;
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : "No pudimos crear tu cuenta." });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } finally {
          setAccessToken(null);
          set({ user: null, error: null, isLoading: false, isInitialized: true });
        }
      },

      updateProfile: async (body) => {
        const user = await api.updateMe(body);
        set({ user: mapUser(user), error: null });
      },

      setUserFromApi: (user) => set({ user: mapUser(user), error: null }),
    }),
    {
      name: "tablas-pintas-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
