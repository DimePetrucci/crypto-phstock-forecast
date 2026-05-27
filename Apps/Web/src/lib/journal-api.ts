import { apiClient } from "@/lib/api-client";
import type { TradeCreate, TradeListResponse, TradeRead, TradeUpdate } from "@/types/trade";

export async function fetchTrades(limit = 100, offset = 0): Promise<TradeListResponse> {
  const { data } = await apiClient.get<TradeListResponse>("/journal/trades", {
    params: { limit, offset },
  });
  return data;
}

export async function createTrade(payload: TradeCreate): Promise<TradeRead> {
  const { data } = await apiClient.post<TradeRead>("/journal/trades", payload);
  return data;
}

export async function updateTrade(id: string, payload: TradeUpdate): Promise<TradeRead> {
  const { data } = await apiClient.patch<TradeRead>(`/journal/trades/${id}`, payload);
  return data;
}

export async function deleteTrade(id: string): Promise<void> {
  await apiClient.delete(`/journal/trades/${id}`);
}
