import { apiClient } from "@/lib/api-client";
import type { AlertCreate, AlertRead, AlertTriggerLogRead, AlertUpdate } from "@/types/alert";

export async function fetchAlerts(activeOnly = false): Promise<AlertRead[]> {
  const { data } = await apiClient.get<AlertRead[]>("/alerts", {
    params: activeOnly ? { active_only: true } : {},
  });
  return data;
}

export async function createAlert(payload: AlertCreate): Promise<AlertRead> {
  const { data } = await apiClient.post<AlertRead>("/alerts", payload);
  return data;
}

export async function updateAlert(id: string, payload: AlertUpdate): Promise<AlertRead> {
  const { data } = await apiClient.patch<AlertRead>(`/alerts/${id}`, payload);
  return data;
}

export async function deleteAlert(id: string): Promise<void> {
  await apiClient.delete(`/alerts/${id}`);
}

export async function fetchAlertEvents(limit = 50): Promise<AlertTriggerLogRead[]> {
  const { data } = await apiClient.get<AlertTriggerLogRead[]>("/alerts/events", {
    params: { limit },
  });
  return data;
}
