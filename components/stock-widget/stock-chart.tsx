"use client";

import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, createSeriesMarkers } from "lightweight-charts";

interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SmaPoint {
  date: string;
  sma: number | null;
}

interface ChartEvent {
  date: string;
  type: "dividend" | "split" | "meeting" | "rights" | "other";
  label: string;
}

export function StockChart({
  data,
  smaData,
  events,
}: {
  data: ChartDataPoint[];
  smaData?: SmaPoint[];
  events?: ChartEvent[];
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: "#e5e7eb20" },
        horzLines: { color: "#e5e7eb20" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: "#e5e7eb40",
      },
      rightPriceScale: {
        borderColor: "#e5e7eb40",
      },
    });

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    candleSeries.setData(
      data.map((d) => ({
        time: d.date,
        open: d.open * 1000,
        high: d.high * 1000,
        low: d.low * 1000,
        close: d.close * 1000,
      }))
    );

    // Event markers
    if (events && events.length > 0) {
      const dates = new Set(data.map((d) => d.date));
      const markers = events
        .filter((e) => dates.has(e.date))
        .map((e) => ({
          time: e.date as import("lightweight-charts").Time,
          position: "aboveBar" as const,
          color:
            e.type === "dividend"
              ? "#22c55e"
              : e.type === "split"
                ? "#3b82f6"
                : e.type === "meeting"
                  ? "#a855f7"
                  : e.type === "rights"
                    ? "#f97316"
                    : "#9ca3af",
          shape: "arrowDown" as const,
          text: e.label,
        }))
        .sort((a, b) =>
          (a.time as string).localeCompare(b.time as string)
        );

      createSeriesMarkers(candleSeries, markers);
    }

    // Volume histogram
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" as const },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    volumeSeries.setData(
      data.map((d) => ({
        time: d.date,
        value: d.volume,
        color: d.close >= d.open ? "#22c55e40" : "#ef444440",
      }))
    );

    // SMA line
    if (smaData && smaData.length > 0) {
      const smaSeries = chart.addSeries(LineSeries, {
        color: "#3b82f6",
        lineWidth: 2,
        priceScaleId: "right",
      });

      smaSeries.setData(
        smaData
          .filter((s) => s.sma !== null)
          .map((s) => ({
            time: s.date,
            value: s.sma! * 1000,
          }))
      );
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, smaData, events]);

  return <div ref={chartContainerRef} className="w-full" />;
}
