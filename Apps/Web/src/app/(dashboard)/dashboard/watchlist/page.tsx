"use client";

import { useState } from "react";
import { useWatchlist, useAddToWatchlist } from "@/hooks/use-watchlist";
import { WatchlistTable } from "@/components/watchlist/watchlist-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function AddItemForm({ onSuccess }: { onSuccess?: () => void }) {
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const add = useAddToWatchlist();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    add.mutate(
      { symbol: symbol.trim().toUpperCase(), asset_name: name.trim() || undefined },
      {
        onSuccess: () => {
          setSymbol("");
          setName("");
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Symbol</label>
        <Input
          placeholder="e.g. BTCUSDT"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          className="w-40"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Name (optional)</label>
        <Input
          placeholder="e.g. Bitcoin"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-48"
        />
      </div>
      <Button type="submit" disabled={add.isPending || !symbol.trim()} size="sm">
        {add.isPending ? "Adding..." : "Add to Watchlist"}
      </Button>
      {add.isError && <p className="text-xs text-red-400 self-center">Failed. Symbol may already be in watchlist.</p>}
    </form>
  );
}

export default function WatchlistPage() {
  const { data, isLoading, refetch } = useWatchlist();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track assets with live prices and 24h performance.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">Add Asset</h2>
        </div>
        <AddItemForm onSuccess={() => refetch()} />
      </div>

      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">{data?.name ?? "My Watchlist"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data?.count ?? 0} asset{data?.count !== 1 ? "s" : ""} tracked
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>Refresh</Button>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground text-center py-4">Loading watchlist...</p>}
        {data && <WatchlistTable items={data.items} />}
      </div>
    </div>
  );
}
