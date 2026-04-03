"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  LineSeries,
  HistogramSeries,
} from "lightweight-charts";

interface FinancialPriceData {
  ticker: string;
  priceData: { date: string; close: number }[];
  financialData: {
    year: number;
    quarter: number;
    revenue: number;
    netProfit: number;
  }[];
}

function quarterToDate(year: number, quarter: number): string {
  const month = quarter * 3;
  const monthStr = month.toString().padStart(2, "0");
  return `${year}-${monthStr}-28`;
}

export function FinancialPriceChart({
  ticker,
  priceData,
  financialData,
}: FinancialPriceData) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || priceData.length === 0) return;

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
      height: 420,
      timeScale: {
        borderColor: "#e5e7eb40",
      },
      rightPriceScale: {
        borderColor: "#e5e7eb40",
      },
    });

    // Price line (right scale)
    const priceSeries = chart.addSeries(LineSeries, {
      color: "#3b82f6",
      lineWidth: 2,
      priceScaleId: "right",
      title: `${ticker} (VND)`,
    });

    priceSeries.setData(
      priceData.map((d) => ({
        time: d.date,
        value: d.close * 1000,
      }))
    );

    // Revenue bars (left scale)
    if (financialData.length > 0) {
      const revenueSeries = chart.addSeries(HistogramSeries, {
        priceScaleId: "financials",
        title: "Doanh thu (tỷ)",
        color: "#22c55e60",
        priceFormat: {
          type: "custom",
          formatter: (price: number) =>
            `${(price / 1e9).toFixed(0)} tỷ`,
        },
      });

      chart.priceScale("financials").applyOptions({
        scaleMargins: { top: 0.5, bottom: 0 },
      });

      revenueSeries.setData(
        financialData
          .filter((f) => f.revenue != null)
          .map((f) => ({
            time: quarterToDate(f.year, f.quarter),
            value: f.revenue,
            color:
              f.netProfit >= 0 ? "#22c55e60" : "#ef444460",
          }))
      );

      // Net profit line (left scale, overlay)
      const profitSeries = chart.addSeries(LineSeries, {
        color: "#f59e0b",
        lineWidth: 2,
        priceScaleId: "financials",
        title: "Lợi nhuận ròng (tỷ)",
        lineStyle: 0,
      });

      profitSeries.setData(
        financialData
          .filter((f) => f.netProfit != null)
          .map((f) => ({
            time: quarterToDate(f.year, f.quarter),
            value: f.netProfit,
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
  }, [ticker, priceData, financialData]);

  // Summary stats
  const latestFinancial = financialData[financialData.length - 1];
  const latestPrice = priceData[priceData.length - 1];

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-3 text-sm">
        <div>
          <span className="text-muted-foreground">Mã: </span>
          <span className="font-semibold">{ticker}</span>
        </div>
        {latestPrice && (
          <div>
            <span className="text-muted-foreground">Giá: </span>
            <span className="font-semibold text-blue-500">
              {(latestPrice.close * 1000).toLocaleString()} VND
            </span>
          </div>
        )}
        {latestFinancial && (
          <>
            <div>
              <span className="text-muted-foreground">
                DT Q{latestFinancial.quarter}/{latestFinancial.year}:{" "}
              </span>
              <span className="font-semibold text-green-500">
                {(latestFinancial.revenue / 1e9).toFixed(0)} tỷ
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">LNST: </span>
              <span
                className={`font-semibold ${
                  latestFinancial.netProfit >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {(latestFinancial.netProfit / 1e9).toFixed(0)} tỷ
              </span>
            </div>
          </>
        )}
      </div>
      <div ref={chartContainerRef} className="w-full" />
      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          Giá cổ phiếu
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-500/40" />
          Doanh thu
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-amber-500" />
          Lợi nhuận ròng
        </div>
      </div>
    </div>
  );
}
