"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  LineSeries,
  AreaSeries,
} from "lightweight-charts";

interface DrawdownPoint {
  date: string;
  close: number;
  drawdown: number;
}

export function DrawdownChart({ data }: { data: DrawdownPoint[] }) {
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

    // Price line on right scale
    const priceSeries = chart.addSeries(LineSeries, {
      color: "#3b82f6",
      lineWidth: 2,
      priceScaleId: "right",
      title: "VN-Index",
    });

    priceSeries.setData(
      data.map((d) => ({
        time: d.date,
        value: d.close,
      }))
    );

    // Drawdown area on left scale
    const drawdownSeries = chart.addSeries(AreaSeries, {
      lineColor: "#ef4444",
      topColor: "#ef444400",
      bottomColor: "#ef444440",
      lineWidth: 1,
      priceScaleId: "left",
      title: "Drawdown %",
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `${price.toFixed(1)}%`,
      },
    });

    chart.priceScale("left").applyOptions({
      borderColor: "#e5e7eb40",
      invertScale: true,
    });

    drawdownSeries.setData(
      data.map((d) => ({
        time: d.date,
        value: d.drawdown,
      }))
    );

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
  }, [data]);

  // Find current & max drawdown
  const current = data[data.length - 1];
  const maxDd = data.reduce(
    (max, d) => (d.drawdown > max.drawdown ? d : max),
    data[0]
  );

  return (
    <div>
      <div className="flex gap-4 mb-3 text-sm">
        <div>
          <span className="text-muted-foreground">Drawdown hiện tại: </span>
          <span
            className={
              current?.drawdown > 5
                ? "text-red-500 font-semibold"
                : "text-green-500 font-semibold"
            }
          >
            -{current?.drawdown.toFixed(2)}%
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Max drawdown: </span>
          <span className="text-red-500 font-semibold">
            -{maxDd?.drawdown.toFixed(2)}% ({maxDd?.date})
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
