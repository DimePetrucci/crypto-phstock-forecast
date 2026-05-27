"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTrade, deleteTrade, fetchTrades, updateTrade } from "@/lib/journal-api";
import type { TradeCreate, TradeUpdate } from "@/types/trade";

export function useTrades(limit = 100, offset = 0) {
  return useQuery({
    queryKey: ["journal", "trades", limit, offset],
    queryFn: () => fetchTrades(limit, offset),
    staleTime: 30_000,
  });
}

export function useCreateTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TradeCreate) => createTrade(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal"] }),
  });
}

export function useUpdateTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TradeUpdate }) => updateTrade(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal"] }),
  });
}

export function useDeleteTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTrade(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal"] }),
  });
}
