"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, refreshToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !refreshToken) {
      router.replace("/login");
    }
  }, [isAuthenticated, refreshToken, router]);

  if (!isAuthenticated && !refreshToken) return null;

  return <>{children}</>;
}
