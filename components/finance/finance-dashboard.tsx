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

const EXCHANGES = ["ALL", "HOSE", "HNX", "UPCOM"] as const;

function TopMoversCard({ gainers, losers }: { gainers: TopStock[]; losers: TopStock[] }) {
  const [exchange, setExchange] = useState("HOSE");

  const filterByExchange = (stocks: TopStock[]) =>
    exchange === "ALL" ? stocks : stocks.filter((s) => s.exchange === exchange);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display uppercase tracking-wider">
          Biến động
        </CardTitle>
        <div className="flex gap-1 mt-2">
          {EXCHANGES.map((ex) => (
            <button
              key={ex}
              onClick={() => setExchange(ex)}
              className={`px-2 py-0.5 text-[0.6rem] uppercase tracking-wider transition-colors ${
                exchange === ex
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {ex === "ALL" ? "Tất cả" : ex}
            </button>
          ))}
        </div>
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
            <MoversList stocks={filterByExchange(gainers).slice(0, 8)} type="gainer" />
          </TabsContent>
          <TabsContent value="losers">
            <MoversList stocks={filterByExchange(losers).slice(0, 8)} type="loser" />
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
  // Filter out items with no meaningful prices, take first few
  const items = gold.filter((g: GoldPrice) => g.buy > 0 || g.sell > 0).slice(0, 5);
  if (items.length === 0) return null;

  function formatGoldPrice(val: number) {
    if (val === 0) return "—";
    if (val > 100000) return (val / 1000000).toFixed(2) + "tr";
    return val.toLocaleString();
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display uppercase tracking-wider">
            Giá Vàng
          </CardTitle>
          <div className="flex gap-6 text-[0.6rem] text-muted-foreground uppercase tracking-wider">
            <span>Mua</span>
            <span>Bán</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {items.map((g: GoldPrice, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground truncate max-w-[140px] text-xs">
                {g.type_code || `Loại ${i + 1}`}
              </span>
              <div className="flex gap-4 font-mono text-xs">
                <span className="text-green-500 w-14 text-right">{formatGoldPrice(g.buy)}</span>
                <span className="text-red-500 w-14 text-right">{formatGoldPrice(g.sell)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface NewsArticle {
  title?: string;
  summary?: string;
  link?: string;
  image_url?: string;
  source?: string;
  published_timestamp?: string;
}

function NewsSection({ news }: { news: NewsArticle[] }) {
  if (!news || news.length === 0) return null;

  const featured = news[0];
  const secondary = news.slice(1, 3);
  const sidebar = news.slice(3, 7);
  const latest = news.slice(7);

  function timeAgo(ts: string | undefined) {
    if (!ts) return "";
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}'`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  function getSource(link: string | undefined) {
    if (!link) return "";
    try {
      return new URL(link).hostname.replace("www.", "").toUpperCase();
    } catch {
      return "";
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold uppercase tracking-wider">
        Tin tức
      </h2>

      {/* Featured + secondary + sidebar grid */}
      <div className="grid lg:grid-cols-[1fr_1fr_300px] gap-4">
        {/* Featured */}
        {featured && (
          <a
            href={featured.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            {featured.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.image_url}
                alt={featured.title || ""}
                className="w-full h-48 object-cover mb-3"
              />
            )}
            <h3 className="font-display font-bold text-lg leading-tight group-hover:underline mb-2">
              {featured.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {featured.summary}
            </p>
            <p className="text-xs text-muted-foreground">
              {getSource(featured.link)} · {timeAgo(featured.published_timestamp)}
            </p>
          </a>
        )}

        {/* Secondary */}
        <div className="space-y-4">
          {secondary.map((article, i) => (
            <a
              key={i}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              {article.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.image_url}
                  alt={article.title || ""}
                  className="w-full h-32 object-cover mb-2"
                />
              )}
              <h3 className="font-semibold text-sm leading-tight group-hover:underline mb-1">
                {article.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {getSource(article.link)} · {timeAgo(article.published_timestamp)}
              </p>
            </a>
          ))}
        </div>

        {/* Sidebar news */}
        <div className="space-y-3">
          {sidebar.map((article, i) => (
            <a
              key={i}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-3"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium leading-tight group-hover:underline line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {getSource(article.link)} · {timeAgo(article.published_timestamp)}
                </p>
              </div>
              {article.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.image_url}
                  alt=""
                  className="w-16 h-16 object-cover shrink-0"
                />
              )}
            </a>
          ))}
        </div>
      </div>

      {/* Latest news list */}
      {latest.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-muted-foreground">
            Mới nhất
          </h3>
          {latest.map((article, i) => (
            <a
              key={i}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-4 py-3 border-t"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm group-hover:underline line-clamp-1">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                  {article.summary}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getSource(article.link)} · {timeAgo(article.published_timestamp)}
                </p>
              </div>
              {article.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.image_url}
                  alt=""
                  className="w-24 h-16 object-cover shrink-0"
                />
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function FinanceDashboard({
  indices,
  chartData,
  gainers,
  losers,
  gold,
  news,
}: {
  indices: IndexSummary[];
  chartData: ChartDataPoint[];
  gainers: TopStock[];
  losers: TopStock[];
  gold: GoldPrice[];
  news: NewsArticle[];
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

      {/* News */}
      <NewsSection news={news} />
    </div>
  );
}
