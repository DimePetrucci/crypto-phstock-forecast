export interface PortfolioRead {
  id: string;
  name: string;
  description: string | null;
  currency: string;
}

export interface HoldingCreate {
  asset_symbol: string;
  asset_name?: string;
  market_type?: string;
  quantity: number;
  avg_buy_price: number;
  exchange?: string;
}

export interface HoldingUpdate {
  quantity?: number;
  avg_buy_price?: number;
  asset_name?: string;
  exchange?: string;
}

export interface HoldingWithPnL {
  id: string;
  asset_symbol: string;
  asset_name: string | null;
  market_type: string;
  exchange: string | null;
  quantity: string;
  avg_buy_price: string;
  current_price: string | null;
  current_value: string | null;
  cost_basis: string;
  unrealised_pnl: string | null;
  unrealised_pnl_pct: number | null;
  allocation_pct: number | null;
}

export interface PortfolioSummary {
  portfolio_id: string;
  portfolio_name: string;
  currency: string;
  total_cost_basis: string;
  total_current_value: string | null;
  total_unrealised_pnl: string | null;
  total_unrealised_pnl_pct: number | null;
  holdings: HoldingWithPnL[];
  holdings_count: number;
}
