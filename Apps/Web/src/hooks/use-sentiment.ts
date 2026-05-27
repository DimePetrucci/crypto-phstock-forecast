"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFearGreed, fetchNews, fetchSentimentSnapshot } from "@/lib/sentiment-api";

export function useFearGreed() {
  return useQuery({
    queryKey: ["sentiment", "fear-greed"],
    queryFn: fetchFearGreed,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useNews(symbol?: string, limit = 20) {
  return useQuery({
    queryKey: ["sentiment", "news", symbol, limit],
    queryFn: () => fetchNews(symbol, limit),
    staleTime: 3 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useSentimentSnapshot(symbol?: string) {
  return useQuery({
    queryKey: ["sentiment", "snapshot", symbol],
    queryFn: () => fetchSentimentSnapshot(symbol),
    staleTime: 3 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
