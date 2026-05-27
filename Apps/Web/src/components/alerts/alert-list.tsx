"use client";

import type { AlertRead } from "@/types/alert";
import { useDeleteAlert, useUpdateAlert } from "@/hooks/use-alerts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  PRICE_ABOVE: "Price >",
  PRICE_BELOW: "Price <",
  RSI_ABOVE: "RSI >",
  RSI_BELOW: "RSI <",
  MACD_CROSSOVER_BULLISH: "MACD Bull Cross",
  MACD_CROSSOVER_BEARISH: "MACD Bear Cross",
  PRICE_PCT_CHANGE_24H: "24h Change ≥",
};

interface AlertListProps {
  alerts: AlertRead[];
}

export function AlertList({ alerts }: AlertListProps) {
  const del = useDeleteAlert();
  const update = useUpdateAlert();

  if (alerts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No alerts configured. Create one above.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
            alert.is_active ? "border-border bg-card" : "border-border/40 bg-card/40 opacity-60"
          )}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{alert.symbol}</span>
              <span className="text-muted-foreground text-xs">
                {TYPE_LABELS[alert.alert_type] ?? alert.alert_type} {parseFloat(alert.threshold).toLocaleString()}
              </span>
            </div>
            {alert.label && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{alert.label}</p>
            )}
            {alert.last_triggered_at && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Last triggered: {new Date(alert.last_triggered_at).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => update.mutate({ id: alert.id, data: { is_active: !alert.is_active } })}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                alert.is_active ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                  alert.is_active ? "translate-x-4.5" : "translate-x-0.5"
                )}
              />
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => del.mutate(alert.id)}
              disabled={del.isPending}
            >
              ×
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
