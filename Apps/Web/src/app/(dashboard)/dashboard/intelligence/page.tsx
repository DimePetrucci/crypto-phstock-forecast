"use client";

import { useState } from "react";
import { useBestPicks, useIntelligenceReport } from "@/hooks/use-intelligence";
import { SignalScoreCard } from "@/components/intelligence/signal-score-card";
import { SignalBadge } from "@/components/intelligence/signal-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const INTERVAL_OPTIONS = [
  { value: "4h", label: "4H" },
  { value: "1d", label: "1D" },
  { value: "1w", label: "1W" },
];

const RISK_LABEL: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  very_high: "Very High",
};

const RISK_COLOR: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  very_high: "text-red-400",
};

function BestPicksTable() {
  const [interval, setInterval] = useState("1d");
  const { data, isLoading } = useBestPicks(interval);

  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Best Picks</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Ranked by composite signal score.</p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          {INTERVAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setInterval(opt.value)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                interval === opt.value ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground text-center py-4">Computing signals...</p>}

      {data && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Symbol</th>
                <th className="pb-2 font-medium text-center">Score</th>
                <th className="pb-2 font-medium text-center">Signal</th>
                <th className="pb-2 font-medium text-center">Confidence</th>
                <th className="pb-2 font-medium text-center">Risk</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((pick) => (
                <tr key={pick.symbol} className="border-b border-border/40 hover:bg-accent/30 transition-colors">
                  <td className="py-2.5 font-semibold">{pick.symbol}</td>
                  <td className="py-2.5 text-center tabular-nums">
                    <span className="font-bold">{pick.composite_score}</span>
                    <span className="text-muted-foreground text-xs">/100</span>
                  </td>
                  <td className="py-2.5 text-center">
                    <SignalBadge recommendation={pick.recommendation} size="sm" />
                  </td>
                  <td className="py-2.5 text-center text-xs capitalize">{pick.confidence}</td>
                  <td className={`py-2.5 text-center text-xs font-medium ${RISK_COLOR[pick.risk_level]}`}>
                    {RISK_LABEL[pick.risk_level]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SymbolAnalysis() {
  const [inputSymbol, setInputSymbol] = useState("");
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);
  const [interval, setInterval] = useState("1d");
  const { data, isLoading, isError } = useIntelligenceReport(activeSymbol ?? "", interval);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSymbol.trim()) {
      setActiveSymbol(inputSymbol.trim().toUpperCase());
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold">Symbol Intelligence</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Analyse any supported asset.</p>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <Input
          placeholder="e.g. BTCUSDT, ETHUSDT"
          value={inputSymbol}
          onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
          className="max-w-xs"
        />
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          {INTERVAL_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setInterval(opt.value)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                interval === opt.value ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Button type="submit" size="sm" disabled={!inputSymbol.trim()}>
          Analyse
        </Button>
      </form>

      {isLoading && activeSymbol && (
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          Computing intelligence for {activeSymbol}...
        </div>
      )}
      {isError && (
        <p className="text-sm text-red-400">Failed to load intelligence report.</p>
      )}
      {data && !isLoading && (
        <SignalScoreCard report={data} />
      )}
    </div>
  );
}

export default function IntelligencePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Market Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rule-based signal analysis. All scores are deterministic and explainable.
        </p>
      </div>

      <BestPicksTable />
      <SymbolAnalysis />

      <div className="rounded-lg border border-border/50 bg-card/30 p-4 text-xs text-muted-foreground">
        <strong>Disclaimer:</strong> Signal scores are rule-based technical analysis tools, not financial advice.
        Scores reflect indicator alignment, not guaranteed future price direction. Always apply your own risk management.
      </div>
    </div>
  );
}
