"use client";

import type { NewsItem } from "@/types/sentiment";
import { cn } from "@/lib/utils";

function sentimentBadge(score: number) {
  if (score > 0.15) return { label: "Positive", cls: "bg-green-500/10 text-green-400 border-green-500/30" };
  if (score < -0.15) return { label: "Negative", cls: "bg-red-500/10 text-red-400 border-red-500/30" };
  return { label: "Neutral", cls: "bg-muted text-muted-foreground border-border" };
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface NewsFeedProps {
  items: NewsItem[];
  className?: string;
}

export function NewsFeed({ items, className }: NewsFeedProps) {
  if (items.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground text-sm", className)}>
        No news available. Configure CRYPTOPANIC_API_KEY to enable news ingestion.
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {items.map((item, idx) => {
        const badge = sentimentBadge(item.sentiment_score);
        return (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-1 rounded-md border border-border bg-card/50 px-3 py-2.5 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start gap-2">
              <p className="flex-1 text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {item.title}
              </p>
              <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[11px] font-medium", badge.cls)}>
                {badge.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{item.source}</span>
              <span>·</span>
              <span>{formatRelativeTime(item.published_at)}</span>
              {item.currencies.length > 0 && (
                <>
                  <span>·</span>
                  <span>{item.currencies.slice(0, 3).join(", ")}</span>
                </>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}
