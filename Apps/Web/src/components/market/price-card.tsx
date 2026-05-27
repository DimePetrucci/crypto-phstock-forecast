"use client";

import { useLivePrice, useTicker } from "@/hooks/use-market-data";
import type { MarketTick } from "@/types/market";

interface PriceCardProps {
  symbol: string;
  initialData?: MarketTick | null;
}

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (num >= 1000) return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (num >= 1) return num.toFixed(4);
  return num.toFixed(6);
}

function formatVolume(vol: string): string {
  const num = parseFloat(vol);
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  return `$${(num / 1_000).toFixed(2)}K`;
}

export function PriceCard({ symbol, initialData }: PriceCardProps) {
  const { data: restData } = useTicker(symbol);
  const base = restData ?? initialData;
  const live = useLivePrice(symbol, base ?? null);
  const tick = live ?? base;

  const isPositive = tick ? tick.change_pct_24h >= 0 : true;
  const changeColor = isPositive ? "text-emerald-400" : "text-red-400";
  const changeBg = isPositive ? "bg-emerald-400/10" : "bg-red-400/10";

  const shortSymbol = symbol.replace("USDT", "").replace("BUSD", "");

  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-white">{shortSymbol}</p>
          <p className="text-xs text-white/40 mt-0.5">{symbol}</p>
        </div>
        {tick && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${changeColor} ${changeBg}`}>
            {isPositive ? "+" : ""}
            {tick.change_pct_24h.toFixed(2)}%
          </span>
        )}
      </div>

      {tick ? (
        <>
          <p className="text-xl font-bold text-white tabular-nums">
            ${formatPrice(tick.price)}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs ${changeColor} tabular-nums`}>
              {isPositive ? "+" : ""}${Math.abs(tick.change_24h).toFixed(2)}
            </span>
            <span className="text-xs text-white/30">24h</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
            <div>
              <p className="text-xs text-white/30">H</p>
              <p className="text-xs text-white/60 tabular-nums">${formatPrice(tick.high_24h)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/30">L</p>
              <p className="text-xs text-white/60 tabular-nums">${formatPrice(tick.low_24h)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/30">Vol</p>
              <p className="text-xs text-white/60 tabular-nums">{formatVolume(tick.volume_24h)}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-2 mt-2">
          <div className="h-6 w-32 rounded bg-white/[0.05] animate-pulse" />
          <div className="h-3 w-20 rounded bg-white/[0.05] animate-pulse" />
        </div>
      )}
    </div>
  );
}
