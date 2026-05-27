export type Recommendation = "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";
export type Confidence = "high" | "medium" | "low";
export type RiskLevel = "low" | "medium" | "high" | "very_high";

export interface SignalFactor {
  name: string;
  score: number;
  max_score: number;
  reason: string;
}

export interface IntelligenceReport {
  symbol: string;
  interval: string;
  composite_score: number;
  recommendation: Recommendation;
  confidence: Confidence;
  risk_level: RiskLevel;
  factors: SignalFactor[];
  data_points_used: number;
  summary: string;
  generated_at: string;
}

export interface BestPick {
  symbol: string;
  composite_score: number;
  recommendation: Recommendation;
  confidence: Confidence;
  risk_level: RiskLevel;
  summary: string;
  generated_at: string;
}

export interface BestPicksResponse {
  items: BestPick[];
  count: number;
  generated_at: string;
}
