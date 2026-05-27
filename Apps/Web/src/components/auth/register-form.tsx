"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegister } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric and underscores only"),
  full_name: z.string().optional(),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/\d/, "Must contain a number"),
});

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const register_ = useRegister();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await register_.mutateAsync(data);
      toast({ title: "Account created", description: "Please sign in." });
    } catch {
      toast({ title: "Registration failed", description: "Email or username already taken", variant: "destructive" });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>Join InvestIQ — AI-powered investment intelligence</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
            { id: "username", label: "Username", type: "text", placeholder: "your_handle" },
            { id: "full_name", label: "Full Name (optional)", type: "text", placeholder: "Juan dela Cruz" },
            { id: "password", label: "Password", type: "password", placeholder: "••••••••" },
          ].map(({ id, label, type, placeholder }) => (
            <div key={id} className="space-y-2">
              <label className="text-sm font-medium" htmlFor={id}>{label}</label>
              <Input id={id} type={type} placeholder={placeholder} {...register(id as keyof FormData)} />
              {errors[id as keyof FormData] && (
                <p className="text-xs text-destructive">{errors[id as keyof FormData]?.message}</p>
              )}
            </div>
          ))}
          <Button type="submit" className="w-full" disabled={isSubmitting || register_.isPending}>
            {register_.isPending ? "Creating account…" : "Create Account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
