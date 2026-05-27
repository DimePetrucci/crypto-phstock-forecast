import { apiClient } from "@/lib/api-client";
import type { FearGreedResult, NewsItem, SentimentSnapshotResponse } from "@/types/sentiment";

export async function fetchFearGreed(): Promise<FearGreedResult> {
  const { data } = await apiClient.get<FearGreedResult>("/sentiment/fear-greed");
  return data;
}

export async function fetchNews(symbol?: string, limit = 20): Promise<NewsItem[]> {
  const params: Record<string, string | number> = { limit };
  if (symbol) params.symbol = symbol;
  const { data } = await apiClient.get<NewsItem[]>("/sentiment/news", { params });
  return data;
}

export async function fetchSentimentSnapshot(symbol?: string): Promise<SentimentSnapshotResponse> {
  const params: Record<string, string> = {};
  if (symbol) params.symbol = symbol;
  const { data } = await apiClient.get<SentimentSnapshotResponse>("/sentiment/snapshot", { params });
  return data;
}
