"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  BarChart2,
  Briefcase,
  BookOpen,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/markets", label: "Markets", icon: TrendingUp },
  { href: "/dashboard/analysis", label: "Analysis", icon: BarChart2 },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card px-4 py-6">
        <div className="mb-8 px-2">
          <span className="text-xl font-bold text-primary">InvestIQ</span>
          <p className="text-xs text-muted-foreground mt-1">AI Investment Intelligence</p>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4 justify-start gap-3 text-muted-foreground"
          onClick={() => logout.mutate()}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6 md:px-8">{children}</div>
      </main>
    </div>
  );
}
