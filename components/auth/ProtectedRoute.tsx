"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdmin, useAuth } from "./AuthContext";

export function ProtectedRoute({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const { user, isLoading, isInitialized } = useAuth();
  const router = useRouter();
  const allowed = Boolean(user) && (!admin || isAdmin(user));

  useEffect(() => {
    if (isInitialized && !isLoading && !allowed)
      router.replace(user ? "/" : "/login");
  }, [allowed, isInitialized, isLoading, user, router]);

  if (!isInitialized || isLoading || !allowed) return null;
  return children;
}
