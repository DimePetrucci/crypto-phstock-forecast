export interface WatchlistItemRead {
  id: string;
  watchlist_id: string;
  symbol: string;
  asset_name: string | null;
  market_type: string;
  notes: string | null;
  added_at: string;
}

export interface WatchlistItemEnriched {
  id: string;
  symbol: string;
  asset_name: string | null;
  market_type: string;
  notes: string | null;
  added_at: string;
  current_price: string | null;
  change_pct_24h: number | null;
  volume_24h: string | null;
}

export interface WatchlistEnrichedResponse {
  id: string;
  name: string;
  items: WatchlistItemEnriched[];
  count: number;
}

export interface WatchlistItemCreate {
  symbol: string;
  asset_name?: string;
  market_type?: string;
  notes?: string;
}
