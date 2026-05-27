"use client";

import type { IndicatorSet, RSISignal, MACDTrend } from "@/types/market";

interface IndicatorsCardProps {
  data: IndicatorSet;
}

const RSI_LABELS: Record<RSISignal, { label: string; color: string; bg: string }> = {
  oversold: { label: "Oversold", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  neutral: { label: "Neutral", color: "text-white/60", bg: "bg-white/[0.06]" },
  overbought: { label: "Overbought", color: "text-amber-400", bg: "bg-amber-400/10" },
};

const MACD_LABELS: Record<MACDTrend, { label: string; color: string; bg: string }> = {
  bullish: { label: "Bullish", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  bearish: { label: "Bearish", color: "text-red-400", bg: "bg-red-400/10" },
  neutral: { label: "Neutral", color: "text-white/60", bg: "bg-white/[0.06]" },
};

function RSIGauge({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct <= 30 ? "#34d399" : pct >= 70 ? "#f59e0b" : "#94a3b8";
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-white/30 mb-1">
        <span>0</span>
        <span>30</span>
        <span>70</span>
        <span>100</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-white/[0.08]">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-background"
          style={{ left: `calc(${pct}% - 5px)`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function PercentBBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value * 100));
  const color = pct >= 80 ? "#f59e0b" : pct <= 20 ? "#34d399" : "#94a3b8";
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-white/30 mb-1">
        <span>Lower</span>
        <span>Middle</span>
        <span>Upper</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-white/[0.08]">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-background"
          style={{ left: `calc(${pct}% - 5px)`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function IndicatorRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-xs font-medium text-white/40 uppercase tracking-wide mb-2">{label}</p>
      {children}
    </div>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color} ${bg}`}>
      {label}
    </span>
  );
}

function interpretIndicator(data: IndicatorSet): string {
  const signals: string[] = [];
  if (data.rsi) {
    if (data.rsi.signal === "oversold") signals.push("RSI suggests potential reversal from oversold levels");
    else if (data.rsi.signal === "overbought") signals.push("RSI indicates elevated overbought conditions");
    else signals.push("RSI is in neutral territory");
  }
  if (data.macd) {
    if (data.macd.trend === "bullish") signals.push("MACD shows bullish momentum continuation");
    else if (data.macd.trend === "bearish") signals.push("MACD signals bearish pressure");
    else signals.push("MACD momentum is mixed");
  }
  if (data.bollinger) {
    const pb = data.bollinger.percent_b;
    if (pb > 0.8) signals.push("price approaching upper Bollinger Band — elevated");
    else if (pb < 0.2) signals.push("price near lower Bollinger Band — compressed");
  }
  if (signals.length === 0) return "Insufficient data to generate a full signal summary.";
  return signals.join(". ") + ".";
}

export function IndicatorsCard({ data }: IndicatorsCardProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-xs text-white/40 leading-relaxed">
          <span className="text-white/60 font-medium">Signal Summary — </span>
          {interpretIndicator(data)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.rsi && (
          <IndicatorRow label={`RSI (${data.rsi.period})`}>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-white tabular-nums">{data.rsi.value.toFixed(1)}</p>
              <Badge {...RSI_LABELS[data.rsi.signal]} />
            </div>
            <RSIGauge value={data.rsi.value} />
          </IndicatorRow>
        )}

        {data.macd && (
          <IndicatorRow label="MACD (12/26/9)">
            <div className="flex items-center justify-between mb-2">
              <div className="space-y-0.5">
                <p className="text-lg font-bold text-white tabular-nums">
                  {data.macd.macd_line.toFixed(4)}
                </p>
                <p className="text-xs text-white/40">
                  Signal: {data.macd.signal_line.toFixed(4)}
                </p>
              </div>
              <Badge {...MACD_LABELS[data.macd.trend]} />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-white/30">Histogram</p>
              <p className={`text-xs tabular-nums font-medium ${data.macd.histogram >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {data.macd.histogram >= 0 ? "+" : ""}{data.macd.histogram.toFixed(4)}
              </p>
            </div>
          </IndicatorRow>
        )}

        {data.bollinger && (
          <IndicatorRow label="Bollinger Bands (20, 2σ)">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Upper</span>
                <span className="text-amber-400 tabular-nums text-xs">${Number(data.bollinger.upper).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Middle</span>
                <span className="text-white/60 tabular-nums text-xs">${Number(data.bollinger.middle).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Lower</span>
                <span className="text-emerald-400 tabular-nums text-xs">${Number(data.bollinger.lower).toLocaleString()}</span>
              </div>
            </div>
            <PercentBBar value={data.bollinger.percent_b} />
            <p className="text-xs text-white/30 mt-1">%B: {(data.bollinger.percent_b * 100).toFixed(1)}%</p>
          </IndicatorRow>
        )}

        <IndicatorRow label="Moving Averages">
          <div className="space-y-2">
            {data.ema_20 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">EMA 20</span>
                <span className="text-xs text-white/70 tabular-nums font-medium">
                  ${Number(data.ema_20.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {data.ema_50 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">EMA 50</span>
                <span className="text-xs text-white/70 tabular-nums font-medium">
                  ${Number(data.ema_50.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {data.sma_200 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">SMA 200</span>
                <span className="text-xs text-white/70 tabular-nums font-medium">
                  ${Number(data.sma_200.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {!data.ema_20 && !data.ema_50 && !data.sma_200 && (
              <p className="text-xs text-white/30">Insufficient data</p>
            )}
          </div>
        </IndicatorRow>
      </div>
    </div>
  );
}
