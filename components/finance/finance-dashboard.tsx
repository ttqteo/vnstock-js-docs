"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown } from "lucide-react";
import { FinanceChart } from "./finance-chart";
import { SymbolLink } from "@/components/stock-widget/stock-chart-dialog";

interface IndexSummary {
  name: string;
  value: number;
  change: number;
  changePct: number;
}

interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TopStock {
  symbol: string;
  exchange: string;
  price1DayAgo: number;
  price5DaysAgo: number;
  price20DaysAgo: number;
  marketCap: number;
  vn30: boolean;
  hnx30: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoldPrice = any;

function getPriceColor(change: number) {
  if (change > 0) return "text-green-500";
  if (change < 0) return "text-red-500";
  return "text-muted-foreground";
}

function IndexCard({ index }: { index: IndexSummary }) {
  const color = getPriceColor(index.change);
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
          {index.name}
        </p>
        <p className="text-2xl font-display font-bold">{index.value.toFixed(2)}</p>
        <p className={`text-sm font-mono ${color}`}>
          {index.change > 0 ? "+" : ""}
          {index.change.toFixed(2)} ({index.change > 0 ? "+" : ""}
          {index.changePct.toFixed(2)}%)
        </p>
      </CardContent>
    </Card>
  );
}

function TopMoversCard({ gainers, losers }: { gainers: TopStock[]; losers: TopStock[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display uppercase tracking-wider">
          Biến động
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="gainers">
          <TabsList className="w-full mb-3">
            <TabsTrigger value="gainers" className="flex-1 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Tăng mạnh
            </TabsTrigger>
            <TabsTrigger value="losers" className="flex-1 text-xs">
              <TrendingDown className="w-3 h-3 mr-1" />
              Giảm mạnh
            </TabsTrigger>
          </TabsList>
          <TabsContent value="gainers">
            <MoversList stocks={gainers.slice(0, 8)} type="gainer" />
          </TabsContent>
          <TabsContent value="losers">
            <MoversList stocks={losers.slice(0, 8)} type="loser" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function MoversList({ stocks, type }: { stocks: TopStock[]; type: "gainer" | "loser" }) {
  return (
    <div className="space-y-1">
      {stocks.map((s) => {
        const price = s.price1DayAgo * 1000;
        const prev = s.price5DaysAgo * 1000;
        const change = prev > 0 ? ((price - prev) / prev) * 100 : 0;
        const color = type === "gainer" ? "text-green-500" : "text-red-500";
        return (
          <div key={s.symbol} className="flex items-center justify-between py-1.5 text-sm">
            <div className="flex items-center gap-2">
              <SymbolLink symbol={s.symbol} className="text-sm" />
              <Badge variant="outline" className="text-[0.6rem] px-1 py-0">
                {s.exchange}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs">{price.toLocaleString()}</span>
              <span className={`font-mono text-xs w-16 text-right ${color}`}>
                {change > 0 ? "+" : ""}{change.toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GoldCard({ gold }: { gold: GoldPrice[] }) {
  if (!gold || gold.length === 0) return null;
  const items = gold.slice(0, 4);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display uppercase tracking-wider">
          Giá Vàng
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {items.map((g: GoldPrice, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground truncate max-w-[140px]">
                {g.name || g.type || `Loại ${i + 1}`}
              </span>
              <div className="flex gap-3 font-mono text-xs">
                <span className="text-green-500">{g.buyPrice?.toLocaleString?.() || g.buyPrice}</span>
                <span className="text-red-500">{g.sellPrice?.toLocaleString?.() || g.sellPrice}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function FinanceDashboard({
  indices,
  chartData,
  gainers,
  losers,
  gold,
}: {
  indices: IndexSummary[];
  chartData: ChartDataPoint[];
  gainers: TopStock[];
  losers: TopStock[];
  gold: GoldPrice[];
}) {
  const [selectedIndex] = useState("VNINDEX");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">
          Thị trường
        </h1>
        <p className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </p>
      </div>

      {/* Index Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {indices.map((idx) => (
          <IndexCard key={idx.name} index={idx} />
        ))}
      </div>

      {/* Main content + Sidebar */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Main: Chart */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display uppercase tracking-wider">
                Biểu đồ {selectedIndex}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {chartData.length > 0 ? (
                <FinanceChart data={chartData} />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Không có dữ liệu
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <TopMoversCard gainers={gainers} losers={losers} />
          <GoldCard gold={gold} />
        </div>
      </div>
    </div>
  );
}
