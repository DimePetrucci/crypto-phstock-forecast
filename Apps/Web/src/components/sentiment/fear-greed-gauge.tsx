"use client";

import type { FearGreedResult } from "@/types/sentiment";
import { cn } from "@/lib/utils";

const ZONE_COLORS: Record<string, string> = {
  "Extreme Fear": "text-red-500",
  Fear: "text-orange-400",
  Neutral: "text-yellow-400",
  Greed: "text-green-400",
  "Extreme Greed": "text-emerald-400",
};

const ZONE_BG: Record<string, string> = {
  "Extreme Fear": "bg-red-500/10 border-red-500/30",
  Fear: "bg-orange-400/10 border-orange-400/30",
  Neutral: "bg-yellow-400/10 border-yellow-400/30",
  Greed: "bg-green-400/10 border-green-400/30",
  "Extreme Greed": "bg-emerald-400/10 border-emerald-400/30",
};

interface FearGreedGaugeProps {
  data: FearGreedResult;
  className?: string;
}

export function FearGreedGauge({ data, className }: FearGreedGaugeProps) {
  const pct = data.value;
  const color = ZONE_COLORS[data.classification] ?? "text-foreground";
  const bg = ZONE_BG[data.classification] ?? "bg-muted border-border";

  // Arc SVG: 180° half-circle
  const radius = 60;
  const cx = 80;
  const cy = 80;
  const startAngle = Math.PI;
  const endAngle = 0;
  const angle = Math.PI - (pct / 100) * Math.PI;
  const needleX = cx + radius * Math.cos(angle);
  const needleY = cy + radius * Math.sin(angle);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <svg viewBox="0 0 160 100" className="w-48 h-32">
        {/* Track */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* Zone fills */}
        {["#ef4444", "#f97316", "#eab308", "#4ade80", "#10b981"].map((color, i) => {
          const segStart = Math.PI - ((i / 5) * Math.PI);
          const segEnd = Math.PI - (((i + 1) / 5) * Math.PI);
          const x1 = cx + radius * Math.cos(segStart);
          const y1 = cy + radius * Math.sin(segStart);
          const x2 = cx + radius * Math.cos(segEnd);
          const y2 = cy + radius * Math.sin(segEnd);
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 0 ${x2} ${y2}`}
              fill="none"
              stroke={color}
              strokeWidth={8}
              strokeLinecap="butt"
              opacity={0.3}
            />
          );
        })}
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="hsl(var(--foreground))"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={4} fill="hsl(var(--foreground))" />
      </svg>

      <div className={cn("px-4 py-2 rounded-lg border text-center", bg)}>
        <span className={cn("text-3xl font-bold tabular-nums", color)}>{pct}</span>
        <p className={cn("text-sm font-medium mt-0.5", color)}>{data.classification}</p>
      </div>
    </div>
  );
}
