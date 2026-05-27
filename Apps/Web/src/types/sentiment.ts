export interface FearGreedResult {
  value: number;
  classification: "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed";
  updated_at: string;
}

export interface NewsItem {
  title: string;
  url: string;
  published_at: string;
  source: string;
  sentiment_score: number;
  currencies: string[];
}

export interface SentimentSnapshotResponse {
  fear_greed: FearGreedResult | null;
  news_count: number;
  overall_news_sentiment: number;
  market_mood: "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed";
  fetched_at: string;
}
