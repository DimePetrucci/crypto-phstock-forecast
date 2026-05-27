"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addHolding,
  createPortfolio,
  fetchPortfolios,
  fetchPortfolioSummary,
  removeHolding,
  updateHolding,
} from "@/lib/portfolio-api";
import type { HoldingCreate, HoldingUpdate } from "@/types/portfolio";

export function usePortfolios() {
  return useQuery({
    queryKey: ["portfolio", "list"],
    queryFn: fetchPortfolios,
    staleTime: 30_000,
  });
}

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ["portfolio", "summary"],
    queryFn: fetchPortfolioSummary,
    staleTime: 30_000,
    retry: (count, err: unknown) => {
      if ((err as { response?: { status?: number } })?.response?.status === 404) return false;
      return count < 2;
    },
  });
}

export function useCreatePortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; currency?: string }) =>
      createPortfolio(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio"] }),
  });
}

export function useAddHolding(portfolioId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: HoldingCreate) => addHolding(portfolioId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio"] }),
  });
}

export function useUpdateHolding(portfolioId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ holdingId, data }: { holdingId: string; data: HoldingUpdate }) =>
      updateHolding(portfolioId, holdingId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio"] }),
  });
}

export function useRemoveHolding(portfolioId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (holdingId: string) => removeHolding(portfolioId, holdingId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio"] }),
  });
}
