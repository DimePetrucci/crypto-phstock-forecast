"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToWatchlist, fetchWatchlist, removeFromWatchlist } from "@/lib/watchlist-api";
import type { WatchlistItemCreate } from "@/types/watchlist";

export function useWatchlist() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: fetchWatchlist,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useAddToWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WatchlistItemCreate) => addToWatchlist(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}

export function useRemoveFromWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => removeFromWatchlist(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}
