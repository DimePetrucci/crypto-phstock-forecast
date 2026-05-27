import { apiClient } from "@/lib/api-client";
import type {
  MarketPricesResponse,
  MarketTick,
  OHLCVResponse,
  IndicatorSet,
  SearchResult,
  Interval,
} from "@/types/market";

export async function fetchMarketPrices(symbols?: string[]): Promise<MarketPricesResponse> {
  const params = symbols?.length ? { symbols: symbols.join(",") } : {};
  const { data } = await apiClient.get<MarketPricesResponse>("/market/prices", { params });
  return data;
}

export async function fetchTicker(symbol: string): Promise<MarketTick> {
  const { data } = await apiClient.get<MarketTick>(`/market/ticker/${symbol}`);
  return data;
}

export async function fetchOHLCV(
  symbol: string,
  interval: Interval = "1d",
  limit = 100,
): Promise<OHLCVResponse> {
  const { data } = await apiClient.get<OHLCVResponse>(`/market/ohlcv/${symbol}`, {
    params: { interval, limit },
  });
  return data;
}

export async function fetchIndicators(symbol: string, interval: Interval = "1d"): Promise<IndicatorSet> {
  const { data } = await apiClient.get<IndicatorSet>(`/market/indicators/${symbol}`, {
    params: { interval },
  });
  return data;
}

export async function searchAssets(q: string): Promise<SearchResult[]> {
  const { data } = await apiClient.get<SearchResult[]>("/market/search", { params: { q } });
  return data;
}
