"use client";

import { createContext, useContext, useEffect } from "react";
import { AuthUser, useAuthStore } from "@/lib/auth-store";
import { ApiUser } from "@/lib/api";

export type { AuthUser } from "@/lib/auth-store";
export { isAdmin } from "@/lib/auth-store";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
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
  error: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthStore();
  const { restoreSession } = auth;

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
