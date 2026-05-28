"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

interface LoginPayload { email: string; password: string }
interface RegisterPayload { email: string; username: string; password: string; full_name?: string }
interface ChangePasswordPayload { current_password: string; new_password: string }
interface ResetPasswordPayload { token: string; new_password: string }

export function useLogin() {
  const { setTokens, setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginPayload) =>
      apiClient.post("/auth/login", data).then((r) => r.data),
    onSuccess: async (data) => {
      setTokens(data.access_token, data.refresh_token);
      const me = await apiClient.get("/auth/me").then((r) => r.data);
      setUser(me);
      router.push("/dashboard");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterPayload) =>
      apiClient.post("/auth/register", data).then((r) => r.data),
    onSuccess: () => router.push("/login?registered=1"),
  });
}

export function useLogout() {
  const { refreshToken, logout } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: () =>
      apiClient.post("/auth/logout", { refresh_token: refreshToken }),
    onSettled: () => {
      logout();
      router.push("/login");
    },
  });
}

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiClient.get("/auth/me").then((r) => r.data),
    enabled: isAuthenticated,
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) =>
      apiClient.post("/auth/verify-email", { token }).then((r) => r.data),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post("/auth/resend-verification", { email }).then((r) => r.data),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post("/auth/forgot-password", { email }).then((r) => r.data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordPayload) =>
      apiClient.post("/auth/reset-password", data).then((r) => r.data),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) =>
      apiClient.post("/auth/change-password", data).then((r) => r.data),
  });
}

export function useDeleteAccount() {
  const { logout } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (password: string) =>
      apiClient.delete("/auth/account", { data: { password } }),
    onSuccess: () => {
      logout();
      router.push("/login");
    },
  });
}
