import { RegisterForm } from "@/components/auth/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <RegisterForm />
    </main>
  );
}
