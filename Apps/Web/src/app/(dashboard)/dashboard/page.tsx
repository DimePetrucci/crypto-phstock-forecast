"use client";

import { useFearGreed } from "@/hooks/use-sentiment";
import { useBestPicks } from "@/hooks/use-intelligence";
import { useAlerts } from "@/hooks/use-alerts";
import { usePortfolioSummary } from "@/hooks/use-portfolio";
import { useMarketPrices } from "@/hooks/use-market-data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function KpiCard({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string;
  sub: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</p>
      <div className="flex items-end gap-2 mt-2">
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend === "up" && <TrendingUp className="h-4 w-4 text-emerald-400 mb-1" />}
        {trend === "down" && <TrendingDown className="h-4 w-4 text-red-400 mb-1" />}
        {trend === "neutral" && <Minus className="h-4 w-4 text-white/30 mb-1" />}
      </div>
      <p className="text-xs text-white/30 mt-1">{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: fearGreed } = useFearGreed();
  const { data: bestPicks } = useBestPicks("1d");
  const { data: alerts } = useAlerts(true);
  const { data: portfolio } = usePortfolioSummary();
  const { data: prices } = useMarketPrices(["BTCUSDT", "ETHUSDT"]);

  const btcTick = prices?.items.find((t) => t.symbol === "BTCUSDT");
  const btcChange = btcTick?.change_pct_24h ?? null;

  const topPick = bestPicks?.items?.[0];
  const activeAlertCount = alerts?.length ?? 0;

  const portfolioValue = portfolio?.total_current_value
    ? `$${parseFloat(portfolio.total_current_value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : "—";
  const portfolioPnl = portfolio?.total_unrealised_pnl_pct
    ? `${portfolio.total_unrealised_pnl_pct > 0 ? "+" : ""}${portfolio.total_unrealised_pnl_pct.toFixed(2)}%`
    : null;

  const fgValue = fearGreed?.value ?? null;
  const fgLabel = fearGreed?.classification ?? null;
  const fgDisplay = fgValue !== null ? `${fgValue} · ${fgLabel}` : "—";
  const fgTrend = fgValue !== null ? (fgValue >= 50 ? "up" : "down") : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Overview</h1>
        <p className="text-sm text-white/40 mt-0.5">
          AI-assisted investment intelligence — probability-based analysis
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Portfolio Value"
          value={portfolioValue}
          sub={
            portfolioPnl
              ? `Unrealised P&L: ${portfolioPnl}`
              : portfolio === undefined
              ? "Loading…"
              : "Create a portfolio to track"
          }
          trend={
            portfolio?.total_unrealised_pnl_pct != null
              ? portfolio.total_unrealised_pnl_pct >= 0
                ? "up"
                : "down"
              : undefined
          }
        />

        <KpiCard
          label="Fear & Greed Index"
          value={fgDisplay}
          sub={
            fgValue !== null
              ? fgValue <= 25
                ? "Extreme Fear — potential opportunity"
                : fgValue >= 75
                ? "Extreme Greed — elevated risk"
                : "Moderate market sentiment"
              : "Loading sentiment data…"
          }
          trend={fgTrend}
        />

        <KpiCard
          label="Active Alerts"
          value={String(activeAlertCount)}
          sub={activeAlertCount === 0 ? "No active price alerts" : `${activeAlertCount} alert${activeAlertCount === 1 ? "" : "s"} monitoring`}
          trend={activeAlertCount > 0 ? "neutral" : undefined}
        />

        <KpiCard
          label="Top Pick"
          value={topPick ? `${topPick.symbol.replace("USDT", "")} · ${topPick.composite_score}` : "—"}
          sub={
            topPick
              ? `${topPick.recommendation} · ${topPick.confidence} confidence`
              : "Intelligence engine loading…"
          }
          trend={
            topPick?.composite_score != null
              ? topPick.composite_score >= 60
                ? "up"
                : topPick.composite_score <= 35
                ? "down"
                : "neutral"
              : undefined
          }
        />
      </div>

      {/* Market snapshot */}
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-sm font-medium text-white/60 mb-4">Market Snapshot</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {prices?.items.slice(0, 4).map((tick) => {
            const change = tick.change_pct_24h;
            return (
              <div key={tick.symbol}>
                <p className="text-xs text-white/40">{tick.symbol.replace("USDT", "")}/USDT</p>
                <p className="text-base font-semibold text-white tabular-nums mt-0.5">
                  ${parseFloat(tick.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-xs font-medium mt-0.5 ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                </p>
              </div>
            );
          })}
          {!prices && (
            <p className="text-xs text-white/30 col-span-4">Loading market data…</p>
          )}
        </div>
      </div>

      {/* Best picks summary */}
      {bestPicks && bestPicks.items.length > 0 && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5">
          <p className="text-sm font-medium text-white/60 mb-4">Intelligence Signals</p>
          <div className="space-y-2">
            {bestPicks.items.slice(0, 5).map((pick) => (
              <div key={pick.symbol} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white">
                    {pick.symbol.replace("USDT", "")}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    pick.recommendation === "STRONG_BUY" || pick.recommendation === "BUY"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : pick.recommendation === "STRONG_SELL" || pick.recommendation === "SELL"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-white/[0.06] text-white/50"
                  }`}>
                    {pick.recommendation.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pick.composite_score >= 60 ? "bg-emerald-500" :
                        pick.composite_score <= 35 ? "bg-red-500" : "bg-yellow-500"
                      }`}
                      style={{ width: `${pick.composite_score}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/40 tabular-nums w-6 text-right">
                    {pick.composite_score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
