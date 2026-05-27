"use client";

import { useState } from "react";
import { useAlerts, useAlertEvents } from "@/hooks/use-alerts";
import { AlertForm } from "@/components/alerts/alert-form";
import { AlertList } from "@/components/alerts/alert-list";

function AlertEventLog() {
  const { data: events = [], isLoading } = useAlertEvents(30);

  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold">Trigger History</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Recent alert events.</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>}

      {events.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground text-center py-4">No alerts triggered yet.</p>
      )}

      {events.length > 0 && (
        <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-md border border-border/50 bg-card/50 px-3 py-2 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{ev.symbol}</span>
                  <span className="text-xs text-muted-foreground">{ev.message}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(ev.triggered_at).toLocaleString()}
                  {ev.trigger_value && ` · Value: ${parseFloat(ev.trigger_value).toLocaleString()}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AlertsPage() {
  const { data: alerts = [], isLoading, refetch } = useAlerts();
  const [showAll, setShowAll] = useState(true);

  const filtered = showAll ? alerts : alerts.filter((a) => a.is_active);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Price and indicator alerts evaluated every 30 seconds.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">Create Alert</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Alerts are checked against live cached prices and indicator values.
          </p>
        </div>
        <AlertForm onSuccess={() => refetch()} />
      </div>

      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Your Alerts</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{alerts.length} alert(s) configured</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
                className="rounded"
              />
              Show inactive
            </label>
          </div>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground text-center py-4">Loading alerts...</p>}
        <AlertList alerts={filtered} />
      </div>

      <AlertEventLog />

      <div className="rounded-lg border border-border/50 bg-card/30 p-4 text-xs text-muted-foreground">
        <strong>Note:</strong> Alerts are evaluated against cached market data updated every few seconds.
        There may be a short delay between actual price movement and alert trigger.
        RSI/MACD alerts require indicator cache to be populated (intelligence refresh every 5 minutes).
      </div>
    </div>
  );
}
