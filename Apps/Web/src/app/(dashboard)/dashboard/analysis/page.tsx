"use client";

import { useState } from "react";
import { useIndicators, useOHLCV } from "@/hooks/use-market-data";
import { IndicatorsCard } from "@/components/market/indicators-card";
import type { Interval } from "@/types/market";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "ADAUSDT"];

const INTERVALS: { value: Interval; label: string }[] = [
  { value: "4h", label: "4H" },
  { value: "1d", label: "1D" },
  { value: "1w", label: "1W" },
  { value: "1m", label: "1M" },
];

export default function AnalysisPage() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState<Interval>("1d");

  const { data: indicators, isLoading, isError, error } = useIndicators(symbol, interval);
  const { data: ohlcv } = useOHLCV(symbol, interval, 50);

  const shortSymbol = symbol.replace("USDT", "");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Technical Analysis</h1>
          <p className="text-sm text-white/40 mt-0.5">
            RSI · MACD · EMA/SMA · Bollinger Bands — probability-based signal interpretation
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex rounded-lg border border-white/[0.06] overflow-hidden">
          {SYMBOLS.map((sym) => (
            <button
              key={sym}
              onClick={() => setSymbol(sym)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                symbol === sym
                  ? "bg-primary text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              }`}
            >
              {sym.replace("USDT", "")}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-white/[0.06] overflow-hidden">
          {INTERVALS.map((iv) => (
            <button
              key={iv.value}
              onClick={() => setInterval(iv.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                interval === iv.value
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              }`}
            >
              {iv.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-sm font-medium text-white">
          {shortSymbol}/USDT
          <span className="text-white/40 font-normal ml-2 text-xs">{interval.toUpperCase()} · Binance</span>
        </p>
        {ohlcv && (
          <p className="text-xs text-white/30 mt-0.5">
            {ohlcv.count} candles · last close:{" "}
            <span className="text-white/50 tabular-nums">
              ${parseFloat(ohlcv.items[ohlcv.items.length - 1]?.close ?? "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </p>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg border border-white/[0.06] bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">
            {(error as Error)?.message ?? "Failed to compute indicators. Ensure market data is available."}
          </p>
        </div>
      )}

      {indicators && !isLoading && (
        <IndicatorsCard data={indicators} />
      )}

      {ohlcv && ohlcv.items.length > 0 && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-sm font-medium text-white/60">
              OHLCV — {shortSymbol} · {interval.toUpperCase()}
              <span className="text-white/30 font-normal ml-1 text-xs">({ohlcv.count} candles)</span>
            </p>
          </div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#0a0a0a]">
                <tr className="border-b border-white/[0.04]">
                  <th className="px-4 py-2 text-left text-white/30 font-medium">Date</th>
                  <th className="px-4 py-2 text-right text-white/30 font-medium">Open</th>
                  <th className="px-4 py-2 text-right text-white/30 font-medium">High</th>
                  <th className="px-4 py-2 text-right text-white/30 font-medium">Low</th>
                  <th className="px-4 py-2 text-right text-white/30 font-medium">Close</th>
                  <th className="px-4 py-2 text-right text-white/30 font-medium">Volume</th>
                </tr>
              </thead>
              <tbody>
                {[...ohlcv.items].reverse().map((candle, i) => {
                  const isGreen = parseFloat(candle.close) >= parseFloat(candle.open);
                  return (
                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-4 py-2 text-white/50">
                        {new Date(candle.open_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                      </td>
                      <td className="px-4 py-2 text-right text-white/60 tabular-nums">
                        {parseFloat(candle.open).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-right text-emerald-400/70 tabular-nums">
                        {parseFloat(candle.high).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-right text-red-400/70 tabular-nums">
                        {parseFloat(candle.low).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-4 py-2 text-right tabular-nums font-medium ${isGreen ? "text-emerald-400" : "text-red-400"}`}>
                        {parseFloat(candle.close).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-right text-white/40 tabular-nums">
                        {(parseFloat(candle.volume) / 1_000).toFixed(1)}K
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
