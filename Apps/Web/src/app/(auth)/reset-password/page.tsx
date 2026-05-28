"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useResetPassword } from "@/hooks/use-auth";

const schema = z.object({
  new_password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/\d/, "Must contain a number"),
  confirm_password: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const resetPassword = useResetPassword();
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await resetPassword.mutateAsync({ token, new_password: data.new_password });
    setDone(true);
  };

  if (!token) {
    return (
      <p className="text-sm text-destructive">
        Invalid reset link. Please request a new one from the{" "}
        <Link href="/forgot-password" className="underline">forgot password</Link> page.
      </p>
    );
  }

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Password reset successfully. You can now sign in.</p>
        <Link href="/login" className="text-sm text-primary hover:underline">Sign in</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="new_password">New Password</label>
        <div className="relative">
          <Input
            id="new_password"
            type={showPw ? "text" : "password"}
            placeholder="Min 8 chars, uppercase, digit"
            className="pr-10"
            {...register("new_password")}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.new_password && <p className="text-xs text-destructive">{errors.new_password.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="confirm_password">Confirm Password</label>
        <div className="relative">
          <Input
            id="confirm_password"
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter password"
            className="pr-10"
            {...register("confirm_password")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
      </div>
      {resetPassword.isError && (
        <p className="text-xs text-destructive">
          Reset link is invalid or expired. Please{" "}
          <Link href="/forgot-password" className="underline">request a new one</Link>.
        </p>
      )}
      <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
        {resetPassword.isPending ? "Resetting…" : "Set New Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
