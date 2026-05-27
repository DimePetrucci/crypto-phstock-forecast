"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  type UTCTimestamp,
} from "lightweight-charts";
import type { OHLCVCandle } from "@/types/market";

interface Props {
  candles: OHLCVCandle[];
  height?: number;
}

export function CandlestickChart({ candles, height = 420 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return;

    const el = containerRef.current;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255,255,255,0.35)",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.06)",
        textColor: "rgba(255,255,255,0.35)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.06)",
        timeVisible: true,
        secondsVisible: false,
      },
      width: el.clientWidth,
      height,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    const sorted = [...candles].sort(
      (a, b) => new Date(a.open_time).getTime() - new Date(b.open_time).getTime()
    );

    candleSeries.setData(
      sorted.map((c) => ({
        time: (Math.floor(new Date(c.open_time).getTime() / 1000)) as UTCTimestamp,
        open: parseFloat(c.open),
        high: parseFloat(c.high),
        low: parseFloat(c.low),
        close: parseFloat(c.close),
      }))
    );

    volumeSeries.setData(
      sorted.map((c) => ({
        time: (Math.floor(new Date(c.open_time).getTime() / 1000)) as UTCTimestamp,
        value: parseFloat(c.volume),
        color:
          parseFloat(c.close) >= parseFloat(c.open)
            ? "rgba(16,185,129,0.25)"
            : "rgba(239,68,68,0.25)",
      }))
    );

    chart.timeScale().fitContent();

    const observer = new ResizeObserver(() => {
      if (el) chart.applyOptions({ width: el.clientWidth });
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [candles, height]);

  if (candles.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-white/30 text-sm"
        style={{ height }}
      >
        No candle data available
      </div>
    );
  }

  return <div ref={containerRef} className="w-full" style={{ height }} />;
}
