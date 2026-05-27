"use client";

import { useSentimentSnapshot, useNews } from "@/hooks/use-sentiment";
import { FearGreedGauge } from "@/components/sentiment/fear-greed-gauge";
import { NewsFeed } from "@/components/sentiment/news-feed";

export default function SentimentPage() {
  const { data: snapshot, isLoading, isError } = useSentimentSnapshot();
  const { data: news = [] } = useNews(undefined, 30);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Market Sentiment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time sentiment indicators for informed decision-making.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fear & Greed */}
        <div className="rounded-lg border border-border bg-card p-5 flex flex-col items-center gap-4">
          <div className="w-full">
            <h2 className="text-sm font-semibold text-foreground">Fear & Greed Index</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Contrarian sentiment indicator — extreme fear may signal accumulation opportunity.
            </p>
          </div>

          {isLoading && (
            <div className="h-32 w-full flex items-center justify-center text-muted-foreground text-sm">
              Loading...
            </div>
          )}
          {isError && (
            <p className="text-sm text-red-400">Failed to load sentiment data.</p>
          )}
          {snapshot?.fear_greed && (
            <FearGreedGauge data={snapshot.fear_greed} />
          )}

          {snapshot && (
            <div className="w-full grid grid-cols-2 gap-3 text-xs pt-2 border-t border-border">
              <div>
                <p className="text-muted-foreground">Market Mood</p>
                <p className="font-medium mt-0.5">{snapshot.market_mood}</p>
              </div>
              <div>
                <p className="text-muted-foreground">News Sentiment</p>
                <p className={`font-medium mt-0.5 ${snapshot.overall_news_sentiment > 0 ? "text-green-400" : snapshot.overall_news_sentiment < 0 ? "text-red-400" : "text-yellow-400"}`}>
                  {snapshot.overall_news_sentiment > 0.15 ? "Positive" : snapshot.overall_news_sentiment < -0.15 ? "Negative" : "Neutral"}{" "}
                  ({snapshot.overall_news_sentiment > 0 ? "+" : ""}{(snapshot.overall_news_sentiment * 100).toFixed(0)}%)
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">News Articles</p>
                <p className="font-medium mt-0.5">{snapshot.news_count}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Updated</p>
                <p className="font-medium mt-0.5">
                  {snapshot.fear_greed
                    ? new Date(snapshot.fear_greed.updated_at).toLocaleTimeString()
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* News Feed */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5 flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Crypto News</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest market news with sentiment scoring.</p>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[500px]">
            <NewsFeed items={news} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-card/30 p-4 text-xs text-muted-foreground">
        <strong>Disclaimer:</strong> Sentiment indicators are educational tools. Fear & Greed Index sourced from Alternative.me.
        High sentiment scores do not guarantee price movements. Always conduct independent research before investing.
      </div>
    </div>
  );
}
