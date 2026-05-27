"use client";

import { useState } from "react";
import { useCreateAlert } from "@/hooks/use-alerts";
import type { AlertCreate, AlertType } from "@/types/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ALERT_TYPES: { value: AlertType; label: string }[] = [
  { value: "PRICE_ABOVE", label: "Price Above" },
  { value: "PRICE_BELOW", label: "Price Below" },
  { value: "RSI_ABOVE", label: "RSI Above" },
  { value: "RSI_BELOW", label: "RSI Below" },
  { value: "MACD_CROSSOVER_BULLISH", label: "MACD Bullish Cross" },
  { value: "MACD_CROSSOVER_BEARISH", label: "MACD Bearish Cross" },
  { value: "PRICE_PCT_CHANGE_24H", label: "24h % Change" },
];

interface AlertFormProps {
  onSuccess?: () => void;
}

export function AlertForm({ onSuccess }: AlertFormProps) {
  const [symbol, setSymbol] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("PRICE_ABOVE");
  const [threshold, setThreshold] = useState("");
  const [label, setLabel] = useState("");
  const create = useCreateAlert();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !threshold) return;

    const payload: AlertCreate = {
      symbol: symbol.toUpperCase(),
      alert_type: alertType,
      threshold,
      label: label || undefined,
    };

    create.mutate(payload, {
      onSuccess: () => {
        setSymbol("");
        setThreshold("");
        setLabel("");
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Symbol</label>
          <Input
            placeholder="e.g. BTCUSDT"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="uppercase"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Alert Type</label>
          <select
            value={alertType}
            onChange={(e) => setAlertType(e.target.value as AlertType)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {ALERT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Threshold</label>
          <Input
            type="number"
            step="any"
            placeholder="e.g. 70000"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Label (optional)</label>
          <Input
            placeholder="e.g. BTC breakout alert"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" disabled={create.isPending || !symbol || !threshold} className="self-end">
        {create.isPending ? "Creating..." : "Create Alert"}
      </Button>

      {create.isError && (
        <p className="text-xs text-red-400">Failed to create alert. Please try again.</p>
      )}
    </form>
  );
}
