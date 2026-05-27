"use client";

import type { WatchlistItemEnriched } from "@/types/watchlist";
import { useRemoveFromWatchlist } from "@/hooks/use-watchlist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WatchlistTableProps {
  items: WatchlistItemEnriched[];
}

export function WatchlistTable({ items }: WatchlistTableProps) {
  const remove = useRemoveFromWatchlist();

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Your watchlist is empty. Add assets to track them here.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="pb-3 font-medium">Asset</th>
            <th className="pb-3 font-medium text-right">Price</th>
            <th className="pb-3 font-medium text-right">24h %</th>
            <th className="pb-3 font-medium text-right">Volume</th>
            <th className="pb-3 font-medium text-right">Added</th>
            <th className="pb-3 w-8" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const pct = item.change_pct_24h;
            const isUp = pct !== null && pct >= 0;
            return (
              <tr key={item.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="py-3 pr-4">
                  <div>
                    <span className="font-semibold">{item.symbol}</span>
                    {item.asset_name && (
                      <p className="text-xs text-muted-foreground">{item.asset_name}</p>
                    )}
                  </div>
                </td>
                <td className="py-3 text-right tabular-nums">
                  {item.current_price
                    ? `$${parseFloat(item.current_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : <span className="text-muted-foreground">—</span>}
                </td>
                <td className={cn("py-3 text-right tabular-nums font-medium", pct === null ? "text-muted-foreground" : isUp ? "text-green-400" : "text-red-400")}>
                  {pct !== null ? `${isUp ? "+" : ""}${pct.toFixed(2)}%` : "—"}
                </td>
                <td className="py-3 text-right tabular-nums text-muted-foreground text-xs">
                  {item.volume_24h
                    ? `$${(parseFloat(item.volume_24h) / 1e6).toFixed(1)}M`
                    : "—"}
                </td>
                <td className="py-3 text-right text-xs text-muted-foreground">
                  {new Date(item.added_at).toLocaleDateString()}
                </td>
                <td className="py-3 pl-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => remove.mutate(item.id)}
                    disabled={remove.isPending}
                  >
                    ×
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
