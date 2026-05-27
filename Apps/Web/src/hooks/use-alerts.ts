"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAlert,
  deleteAlert,
  fetchAlertEvents,
  fetchAlerts,
  updateAlert,
} from "@/lib/alerts-api";
import type { AlertCreate, AlertUpdate } from "@/types/alert";

export function useAlerts(activeOnly = false) {
  return useQuery({
    queryKey: ["alerts", { activeOnly }],
    queryFn: () => fetchAlerts(activeOnly),
    staleTime: 30 * 1000,
  });
}

export function useAlertEvents(limit = 50) {
  return useQuery({
    queryKey: ["alerts", "events", limit],
    queryFn: () => fetchAlertEvents(limit),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useCreateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AlertCreate) => createAlert(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

export function useUpdateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AlertUpdate }) => updateAlert(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

export function useDeleteAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}
