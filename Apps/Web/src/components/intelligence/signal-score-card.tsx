"use client";

import type { IntelligenceReport } from "@/types/intelligence";
import { SignalBadge } from "./signal-badge";
import { cn } from "@/lib/utils";

const RISK_COLOR: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  very_high: "text-red-400",
};

const CONF_LABEL: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

interface SignalScoreCardProps {
  report: IntelligenceReport;
  className?: string;
}

export function SignalScoreCard({ report, className }: SignalScoreCardProps) {
  const riskColor = RISK_COLOR[report.risk_level] ?? "text-foreground";

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4 flex flex-col gap-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{report.symbol}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-bold tabular-nums">{report.composite_score}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>
        <SignalBadge recommendation={report.recommendation} size="md" />
      </div>

      {/* Score bar */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${report.composite_score}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{report.summary}</p>

      <div className="flex items-center gap-4 text-xs">
        <span>
          Confidence:{" "}
          <span className="font-medium text-foreground">{CONF_LABEL[report.confidence]}</span>
        </span>
        <span>
          Risk:{" "}
          <span className={cn("font-medium", riskColor)}>
            {report.risk_level.replace("_", " ").toUpperCase()}
          </span>
        </span>
      </div>

      {/* Factor breakdown */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-muted-foreground">Signal Breakdown</p>
        {report.factors.map((f) => (
          <div key={f.name} className="flex items-center gap-2 text-xs">
            <span className="w-24 shrink-0 text-muted-foreground">{f.name}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${(f.score / f.max_score) * 100}%` }}
              />
            </div>
            <span className="w-12 text-right tabular-nums text-muted-foreground">
              {f.score}/{f.max_score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
