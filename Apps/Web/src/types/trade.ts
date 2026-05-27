export interface TradeCreate {
  portfolio_id: string;
  asset_symbol: string;
  asset_name?: string;
  market_type?: string;
  exchange?: string;
  trade_type: "buy" | "sell";
  buy_price?: number;
  sell_price?: number;
  quantity: number;
  position_size?: number;
  fees_paid?: number;
  currency?: string;
  entry_at?: string;
  exit_at?: string;
  pnl_amount?: number;
  pnl_percentage?: number;
  notes?: string;
  strategy_tags?: string[];
}

export interface TradeUpdate {
  sell_price?: number;
  quantity?: number;
  fees_paid?: number;
  exit_at?: string;
  pnl_amount?: number;
  pnl_percentage?: number;
  notes?: string;
  strategy_tags?: string[];
}

export interface TradeRead {
  id: string;
  portfolio_id: string;
  asset_symbol: string;
  asset_name: string | null;
  market_type: string;
  exchange: string;
  trade_type: string;
  buy_price: string | null;
  sell_price: string | null;
  quantity: string;
  position_size: string | null;
  fees_paid: string;
  currency: string;
  entry_at: string | null;
  exit_at: string | null;
  pnl_amount: string | null;
  pnl_percentage: string | null;
  break_even_price: string | null;
  notes: string | null;
  strategy_tags: string[] | null;
  created_at: string;
}

export interface TradeListResponse {
  items: TradeRead[];
  count: number;
}
