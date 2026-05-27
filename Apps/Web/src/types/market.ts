export type MarketSource = "binance" | "coingecko";
export type RSISignal = "oversold" | "neutral" | "overbought";
export type MACDTrend = "bullish" | "bearish" | "neutral";
export type Interval = "4h" | "1d" | "1w" | "1m" | "1y";

export interface MarketTick {
  symbol: string;
  price: string;
  change_24h: number;
  change_pct_24h: number;
  volume_24h: string;
  high_24h: string;
  low_24h: string;
  market_cap: string | null;
  timestamp: string;
  source: MarketSource;
}

export interface OHLCVCandle {
  open_time: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  close_time: string;
  quote_volume: string | null;
  num_trades: number | null;
}

export interface RSIResult {
  value: number;
  period: number;
  signal: RSISignal;
}

export interface MACDResult {
  macd_line: number;
  signal_line: number;
  histogram: number;
  trend: MACDTrend;
}

export interface EMAResult {
  value: number;
  period: number;
}

export interface SMAResult {
  value: number;
  period: number;
}

export interface BollingerResult {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
  percent_b: number;
}

export interface IndicatorSet {
  symbol: string;
  interval: string;
  rsi: RSIResult | null;
  macd: MACDResult | null;
  ema_20: EMAResult | null;
  ema_50: EMAResult | null;
  sma_200: SMAResult | null;
  bollinger: BollingerResult | null;
  computed_at: string;
}

export interface MarketPricesResponse {
  items: MarketTick[];
  count: number;
}

export interface OHLCVResponse {
  symbol: string;
  interval: string;
  items: OHLCVCandle[];
  count: number;
}

export interface SearchResult {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number | null;
  thumb: string | null;
}
