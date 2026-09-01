"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AuthUser = {
  email: string;
  name: string;
  initials: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const DUMMY_USER: AuthUser = {
  email: "user@test.com",
  name: "Usuario de prueba",
  initials: "UT",
};

const AUTH_STORAGE_KEY = "tablas-pintas-auth";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(window.localStorage.getItem(AUTH_STORAGE_KEY) === "true" ? DUMMY_USER : null);
    setIsLoading(false);
  }, []);

  function login(email: string, password: string) {
    const isValid = email.trim().toLowerCase() === DUMMY_USER.email && password === "user";
    if (!isValid) return false;

    setUser(DUMMY_USER);
    window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
    return true;
  }

  function logout() {
    setUser(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
