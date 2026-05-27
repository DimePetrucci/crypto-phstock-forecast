"use client";

import { useState } from "react";
import { useMarketPrices, useAssetSearch } from "@/hooks/use-market-data";
import { PriceCard } from "@/components/market/price-card";

const TRACKED = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "ADAUSDT"];

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: prices, isLoading, isError } = useMarketPrices();
  const { data: searchResults, isFetching: isSearching } = useAssetSearch(searchQuery);

  const showSearch = searchQuery.length >= 2;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Markets</h1>
          <p className="text-sm text-white/40 mt-0.5">Live crypto market data — Binance feed</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white/40">Live</span>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search assets... (e.g. bitcoin, solana)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 focus:bg-white/[0.06] transition-colors"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        )}
      </div>

      {showSearch && searchResults && searchResults.length > 0 && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04]">
          {searchResults.slice(0, 8).map((result) => (
            <div key={result.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors">
              {result.thumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={result.thumb} alt={result.name} className="w-6 h-6 rounded-full" />
              )}
              <div>
                <p className="text-sm text-white font-medium">{result.name}</p>
                <p className="text-xs text-white/40">{result.symbol}</p>
              </div>
              {result.market_cap_rank && (
                <span className="ml-auto text-xs text-white/30">#{result.market_cap_rank}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {showSearch && searchResults?.length === 0 && !isSearching && (
        <p className="text-sm text-white/40 text-center py-4">No assets found for &quot;{searchQuery}&quot;</p>
      )}

      {!showSearch && (
        <>
          {isError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">Failed to load market data. Retrying...</p>
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {TRACKED.map((sym) => (
                <div key={sym} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4 h-36 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {prices?.items.map((tick) => (
                <PriceCard key={tick.symbol} symbol={tick.symbol} initialData={tick} />
              ))}
              {(!prices?.items || prices.items.length === 0) &&
                TRACKED.map((sym) => <PriceCard key={sym} symbol={sym} />)}
            </div>
          )}

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-sm font-medium text-white/60">Market Overview</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="px-4 py-3 text-left text-xs text-white/30 font-medium">Symbol</th>
                    <th className="px-4 py-3 text-right text-xs text-white/30 font-medium">Price</th>
                    <th className="px-4 py-3 text-right text-xs text-white/30 font-medium">24h Change</th>
                    <th className="px-4 py-3 text-right text-xs text-white/30 font-medium">24h High</th>
                    <th className="px-4 py-3 text-right text-xs text-white/30 font-medium">24h Low</th>
                    <th className="px-4 py-3 text-right text-xs text-white/30 font-medium">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {prices?.items.map((tick) => {
                    const isPos = tick.change_pct_24h >= 0;
                    return (
                      <tr key={tick.symbol} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-white font-medium">
                          {tick.symbol.replace("USDT", "")}
                          <span className="text-white/30 text-xs ml-1">USDT</span>
                        </td>
                        <td className="px-4 py-3 text-right text-white tabular-nums">
                          ${parseFloat(tick.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`px-4 py-3 text-right tabular-nums ${isPos ? "text-emerald-400" : "text-red-400"}`}>
                          {isPos ? "+" : ""}{tick.change_pct_24h.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-right text-white/60 tabular-nums">
                          ${parseFloat(tick.high_24h).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right text-white/60 tabular-nums">
                          ${parseFloat(tick.low_24h).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right text-white/60 tabular-nums">
                          ${(parseFloat(tick.volume_24h) / 1_000_000).toFixed(1)}M
                        </td>
                      </tr>
                    );
                  })}
                  {!prices?.items?.length && !isLoading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-white/30 text-xs">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
