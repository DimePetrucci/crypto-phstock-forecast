"use client";

import { useState } from "react";
import { useIndicators, useOHLCV } from "@/hooks/use-market-data";
import { IndicatorsCard } from "@/components/market/indicators-card";
import { CandlestickChart } from "@/components/charts/candlestick-chart";
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
  const { data: ohlcv, isLoading: ohlcvLoading } = useOHLCV(symbol, interval, 120);

  const shortSymbol = symbol.replace("USDT", "");
  const lastCandle = ohlcv?.items[ohlcv.items.length - 1];
  const lastClose = lastCandle ? parseFloat(lastCandle.close) : null;
  const prevCandle = ohlcv?.items[ohlcv.items.length - 2];
  const prevClose = prevCandle ? parseFloat(prevCandle.close) : null;
  const pctChange = lastClose && prevClose ? ((lastClose - prevClose) / prevClose) * 100 : null;

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

      {/* Controls */}
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

      {/* Chart header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-white">
            {shortSymbol}/USDT
            <span className="text-white/40 font-normal ml-2 text-xs">{interval.toUpperCase()} · Binance</span>
          </p>
          {lastClose && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-bold text-white tabular-nums">
                ${lastClose.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              {pctChange !== null && (
                <span className={`text-xs font-medium ${pctChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(2)}%
                </span>
              )}
            </div>
          )}
        </div>
        {ohlcv && (
          <p className="text-xs text-white/30">{ohlcv.count} candles</p>
        )}
      </div>

      {/* Candlestick Chart */}
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
        {ohlcvLoading ? (
          <div className="h-[420px] flex items-center justify-center text-white/30 text-sm animate-pulse">
            Loading chart data…
          </div>
        ) : (
          <CandlestickChart candles={ohlcv?.items ?? []} height={420} />
        )}
      </div>

      {/* Indicators */}
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
    </div>
  );
}
