"use client";

import type { Recommendation } from "@/types/intelligence";
import { cn } from "@/lib/utils";

const CONFIG: Record<Recommendation, { label: string; cls: string }> = {
  STRONG_BUY: { label: "Strong Buy", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  BUY: { label: "Buy", cls: "bg-green-500/10 text-green-400 border-green-500/30" },
  NEUTRAL: { label: "Neutral", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
  SELL: { label: "Sell", cls: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
  STRONG_SELL: { label: "Strong Sell", cls: "bg-red-500/10 text-red-400 border-red-500/30" },
};

interface SignalBadgeProps {
  recommendation: Recommendation;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SignalBadge({ recommendation, size = "md", className }: SignalBadgeProps) {
  const { label, cls } = CONFIG[recommendation];
  const sizeClass = {
    sm: "px-1.5 py-0.5 text-[11px]",
    md: "px-2 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  }[size];

  return (
    <span className={cn("inline-flex items-center rounded border font-semibold", sizeClass, cls, className)}>
      {label}
    </span>
  );
}
