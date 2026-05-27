import { apiClient } from "@/lib/api-client";
import type {
  HoldingCreate,
  HoldingUpdate,
  HoldingWithPnL,
  PortfolioRead,
  PortfolioSummary,
} from "@/types/portfolio";

export async function fetchPortfolios(): Promise<PortfolioRead[]> {
  const { data } = await apiClient.get<PortfolioRead[]>("/portfolio");
  return data;
}

export async function createPortfolio(payload: {
  name: string;
  description?: string;
  currency?: string;
}): Promise<PortfolioRead> {
  const { data } = await apiClient.post<PortfolioRead>("/portfolio", payload);
  return data;
}

export async function fetchPortfolioSummary(): Promise<PortfolioSummary> {
  const { data } = await apiClient.get<PortfolioSummary>("/portfolio/summary");
  return data;
}

export async function addHolding(
  portfolioId: string,
  payload: HoldingCreate
): Promise<HoldingWithPnL> {
  const { data } = await apiClient.post<HoldingWithPnL>(
    `/portfolio/${portfolioId}/holdings`,
    payload
  );
  return data;
}

export async function updateHolding(
  portfolioId: string,
  holdingId: string,
  payload: HoldingUpdate
): Promise<HoldingWithPnL> {
  const { data } = await apiClient.patch<HoldingWithPnL>(
    `/portfolio/${portfolioId}/holdings/${holdingId}`,
    payload
  );
  return data;
}

export async function removeHolding(portfolioId: string, holdingId: string): Promise<void> {
  await apiClient.delete(`/portfolio/${portfolioId}/holdings/${holdingId}`);
}
