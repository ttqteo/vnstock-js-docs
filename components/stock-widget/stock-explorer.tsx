"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TickerSearch } from "./ticker-search";
import { StockChart } from "./stock-chart";
import { FinancialPriceChart } from "./financial-price-chart";
import { Loader2 } from "lucide-react";
import { sma, rsi, Vnstock } from "vnstock-js";

interface CompanyProfile {
  industry: string;
  industryEn: string;
  sector: string;
  sectorEn: string;
  issuedShares: number;
}

interface Shareholder {
  name: string;
  percentage: number;
}

interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface IndicatorRow {
  date: string;
  close: number;
  sma20: number | null;
  rsi14: number | null;
}

interface FinRow {
  year: number;
  quarter: number;
  revenue: number;
  netProfit: number;
}

interface StockData {
  ticker: string;
  profile: CompanyProfile | null;
  shareholders: Shareholder[];
  ratios: {
    pe: number | null;
    eps: number | null;
    pb: number | null;
    roe: number | null;
  } | null;
  chartData: ChartDataPoint[];
  smaData: { date: string; sma: number | null }[];
  indicators: IndicatorRow[];
  financialData: FinRow[];
}

function getRsiColor(rsi: number): string {
  if (rsi >= 70) return "text-red-600";
  if (rsi <= 30) return "text-green-600";
  return "";
}

function getRsiLabel(rsi: number): string | null {
  if (rsi >= 70) return "Quá mua";
  if (rsi <= 30) return "Quá bán";
  return null;
}

export function StockExplorer({
  initialData,
}: {
  initialData: StockData;
}) {
  const [data, setData] = useState<StockData>(initialData);
  const [loading, setLoading] = useState(false);

  const loadTicker = useCallback(async (ticker: string) => {
    setLoading(true);
    try {
      const [infoRes, quoteRes] = await Promise.all([
        fetch(`/api/stock/info?ticker=${ticker}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/stock/quote?ticker=${ticker}`).then((r) => r.json()).catch(() => []),
      ]);

      const chartArr: ChartDataPoint[] = Array.isArray(quoteRes) ? quoteRes : [];
      const sma20 = chartArr.length > 0 ? sma(chartArr, { period: 20 }) : [];
      const rsi14 = chartArr.length > 0 ? rsi(chartArr) : [];
      const indicators = chartArr.map((h, i) => ({
        date: h.date,
        close: h.close,
        sma20: sma20[i]?.sma ?? null,
        rsi14: rsi14[i]?.rsi ?? null,
      }));

      // Fetch financials
      let financialData: FinRow[] = [];
      try {
        const vnstock = new Vnstock();
        const result = await vnstock.stock.financials.incomeStatement({
          symbol: ticker,
          period: "quarter",
        });
        if (result?.data && Array.isArray(result.data)) {
          financialData = result.data
            .filter((f: Record<string, unknown>) => f.year != null && f.quarter != null)
            .map((f: Record<string, unknown>) => ({
              year: f.year as number,
              quarter: f.quarter as number,
              revenue: (f.revenue as number) ?? 0,
              netProfit: (f.netProfit as number) ?? (f.netIncome as number) ?? 0,
            }))
            .sort((a, b) => a.year - b.year || a.quarter - b.quarter);
        }
      } catch {}

      setData({
        ticker,
        profile: infoRes?.profile ?? null,
        shareholders: infoRes?.shareholders ?? [],
        ratios: infoRes?.ratios ?? null,
        chartData: chartArr,
        smaData: sma20,
        indicators,
        financialData,
      });
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  const lastIndicators = data.indicators.slice(-8);
  const priceData = data.chartData.map((h) => ({ date: h.date, close: h.close }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="max-w-xs flex-1">
          <TickerSearch
            onSelect={loadTicker}
            placeholder="Tìm mã cổ phiếu (VD: FPT, VNM...)"
          />
        </div>
        <span className="text-xl font-bold">{data.ticker}</span>
        {data.profile && (
          <Badge variant="outline">{data.profile.industry}</Badge>
        )}
        {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList>
          <TabsTrigger value="chart">Biểu đồ</TabsTrigger>
          <TabsTrigger value="indicators">Chỉ báo</TabsTrigger>
          <TabsTrigger value="financials">Tài chính</TabsTrigger>
          <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="pt-2">
          {data.chartData.length > 0 ? (
            <StockChart data={data.chartData} smaData={data.smaData} />
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              {loading ? "Đang tải..." : "Không có dữ liệu"}
            </div>
          )}
        </TabsContent>

        <TabsContent value="indicators" className="pt-2">
          {lastIndicators.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Ngày</th>
                    <th className="text-right py-2 font-medium">Giá đóng cửa</th>
                    <th className="text-right py-2 font-medium">SMA(20)</th>
                    <th className="text-right py-2 font-medium">RSI(14)</th>
                    <th className="py-2 font-medium">Tín hiệu</th>
                  </tr>
                </thead>
                <tbody>
                  {lastIndicators.map((row) => (
                    <tr key={row.date} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-2">{row.date}</td>
                      <td className="text-right py-2">
                        {(row.close * 1000).toLocaleString()}
                      </td>
                      <td className="text-right py-2">
                        {row.sma20 != null ? (row.sma20 * 1000).toLocaleString() : "—"}
                      </td>
                      <td className={`text-right py-2 font-medium ${row.rsi14 != null ? getRsiColor(row.rsi14) : ""}`}>
                        {row.rsi14 != null ? row.rsi14.toFixed(1) : "—"}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-1 flex-wrap">
                          {row.rsi14 != null && getRsiLabel(row.rsi14) && (
                            <Badge
                              className={
                                row.rsi14 >= 70
                                  ? "bg-rose-100 text-rose-700 hover:bg-rose-100"
                                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              }
                            >
                              {getRsiLabel(row.rsi14)}
                            </Badge>
                          )}
                          {row.sma20 != null && row.close > row.sma20 && (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                              Trên SMA
                            </Badge>
                          )}
                          {row.sma20 != null && row.close < row.sma20 && (
                            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                              Dưới SMA
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              {loading ? "Đang tải..." : "Không có dữ liệu"}
            </div>
          )}
        </TabsContent>

        <TabsContent value="financials" className="pt-2">
          {priceData.length > 0 ? (
            <FinancialPriceChart
              ticker={data.ticker}
              priceData={priceData}
              financialData={data.financialData}
            />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              {loading ? "Đang tải..." : "Không có dữ liệu"}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="pt-2">
          {data.profile ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {data.ticker}
                  <Badge variant="outline">{data.profile.industry}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-muted-foreground">Ngành</p>
                    <p className="font-medium">{data.profile.sector}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CP phát hành</p>
                    <p className="font-medium">
                      {data.profile.issuedShares?.toLocaleString() ?? "—"}
                    </p>
                  </div>
                  {data.ratios?.pe != null && data.ratios.pe > 0 && (
                    <div>
                      <p className="text-muted-foreground">P/E</p>
                      <p className="font-medium">{data.ratios.pe.toFixed(2)}</p>
                    </div>
                  )}
                  {data.ratios?.pb != null && data.ratios.pb > 0 && (
                    <div>
                      <p className="text-muted-foreground">P/B</p>
                      <p className="font-medium">{data.ratios.pb.toFixed(2)}</p>
                    </div>
                  )}
                  {data.ratios?.eps != null && data.ratios.eps > 0 && (
                    <div>
                      <p className="text-muted-foreground">EPS</p>
                      <p className="font-medium">{Math.round(data.ratios.eps).toLocaleString()}</p>
                    </div>
                  )}
                  {data.ratios?.roe != null && data.ratios.roe > 0 && (
                    <div>
                      <p className="text-muted-foreground">ROE</p>
                      <p className="font-medium text-green-500">
                        {(data.ratios.roe * 100).toFixed(2)}%
                      </p>
                    </div>
                  )}
                </div>
                {data.shareholders.length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-2">Cổ đông lớn</p>
                    <div className="space-y-1">
                      {data.shareholders.slice(0, 5).map((sh, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="truncate max-w-[250px]">{sh.name}</span>
                          <span className="font-medium">
                            {sh.percentage != null
                              ? `${(sh.percentage * 100).toFixed(1)}%`
                              : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              {loading ? "Đang tải..." : "Chọn mã cổ phiếu để xem"}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
