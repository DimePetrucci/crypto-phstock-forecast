import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  fetchMarketPrices,
  fetchTicker,
  fetchOHLCV,
  fetchIndicators,
  searchAssets,
} from "@/lib/market-api";
import type { MarketTick, Interval } from "@/types/market";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";

export function useMarketPrices(symbols?: string[]) {
  return useQuery({
    queryKey: ["market", "prices", symbols],
    queryFn: () => fetchMarketPrices(symbols),
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}

export function useTicker(symbol: string) {
  return useQuery({
    queryKey: ["market", "ticker", symbol],
    queryFn: () => fetchTicker(symbol),
    refetchInterval: 10_000,
    staleTime: 5_000,
    enabled: Boolean(symbol),
  });
}

export function useOHLCV(symbol: string, interval: Interval = "1d", limit = 100) {
  return useQuery({
    queryKey: ["market", "ohlcv", symbol, interval, limit],
    queryFn: () => fetchOHLCV(symbol, interval, limit),
    refetchInterval: 60_000,
    staleTime: 30_000,
    enabled: Boolean(symbol),
  });
}

export function useIndicators(symbol: string, interval: Interval = "1d") {
  return useQuery({
    queryKey: ["market", "indicators", symbol, interval],
    queryFn: () => fetchIndicators(symbol, interval),
    refetchInterval: 60_000,
    staleTime: 30_000,
    enabled: Boolean(symbol),
  });
}

export function useAssetSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: ["market", "search", debouncedQuery],
    queryFn: () => searchAssets(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60_000,
  });
}

// Live WebSocket price override — merges real-time ticks on top of REST data
export function useLivePrice(symbol: string, fallback: MarketTick | null = null) {
  const [liveTick, setLiveTick] = useState<MarketTick | null>(fallback);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!symbol) return;
    const ws = new WebSocket(`${WS_BASE}/ws/market/price:${symbol}`);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data) as MarketTick;
        setLiveTick(data);
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => ws.close();

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [symbol]);

  return liveTick ?? fallback;
}
