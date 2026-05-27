import { apiClient } from "@/lib/api-client";
import type { WatchlistEnrichedResponse, WatchlistItemCreate, WatchlistItemRead } from "@/types/watchlist";

export async function fetchWatchlist(): Promise<WatchlistEnrichedResponse> {
  const { data } = await apiClient.get<WatchlistEnrichedResponse>("/watchlist");
  return data;
}

export async function addToWatchlist(payload: WatchlistItemCreate): Promise<WatchlistItemRead> {
  const { data } = await apiClient.post<WatchlistItemRead>("/watchlist", payload);
  return data;
}

export async function removeFromWatchlist(itemId: string): Promise<void> {
  await apiClient.delete(`/watchlist/${itemId}`);
}
