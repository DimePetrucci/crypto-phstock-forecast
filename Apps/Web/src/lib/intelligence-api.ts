import { apiClient } from "@/lib/api-client";
import type { IntelligenceReport, BestPicksResponse } from "@/types/intelligence";

export async function fetchIntelligenceReport(symbol: string, interval = "1d"): Promise<IntelligenceReport> {
  const { data } = await apiClient.get<IntelligenceReport>(`/intelligence/${symbol}`, {
    params: { interval },
  });
  return data;
}

export async function fetchBestPicks(interval = "1d"): Promise<BestPicksResponse> {
  const { data } = await apiClient.get<BestPicksResponse>("/intelligence", {
    params: { interval },
  });
  return data;
}
