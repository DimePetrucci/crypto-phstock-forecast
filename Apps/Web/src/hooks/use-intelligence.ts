"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBestPicks, fetchIntelligenceReport } from "@/lib/intelligence-api";

export function useIntelligenceReport(symbol: string, interval = "1d") {
  return useQuery({
    queryKey: ["intelligence", symbol, interval],
    queryFn: () => fetchIntelligenceReport(symbol, interval),
    staleTime: 3 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: !!symbol,
  });
}

export function useBestPicks(interval = "1d") {
  return useQuery({
    queryKey: ["intelligence", "best-picks", interval],
    queryFn: () => fetchBestPicks(interval),
    staleTime: 3 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
