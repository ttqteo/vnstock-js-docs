"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, LayoutDashboard, BarChart3 } from "lucide-react";
import { FinanceChart } from "./finance-chart";
import { SymbolLink } from "@/components/stock-widget/stock-chart-dialog";
import { StockLookup } from "./stock-lookup";
import { WatchlistPanel } from "./watchlist-panel";
import { AcademyPanel } from "./academy-panel";

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

interface FuelPrice {
  name: string;
  price: string;
  change: string;
}

interface ExchangeRate {
  currencyCode: string;
  currencyName: string;
  buyCash: string;
  buyTransfer: string;
  sell: string;
}

interface IndexSparkline {
  name: string;
  closes: number[];
}

// ── SVG Sparkline (reusable) ───────────────────────────────────
function Sparkline({
  values,
  color,
  width = 80,
  height = 28,
}: {
  values: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 1;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = pad + (height - 2 * pad) - ((v - min) / range) * (height - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} className="block">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Exchange Rate Card ─────────────────────────────────────────
const FEATURED_CURRENCIES = ["USD", "EUR", "JPY", "GBP", "CNY", "KRW", "SGD", "THB"];

function ExchangeRateCard({ rates }: { rates: ExchangeRate[] }) {
  if (!rates || rates.length === 0) return null;
  const featured = rates.filter((r) =>
    FEATURED_CURRENCIES.includes(r.currencyCode)
  );
  if (featured.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display uppercase tracking-wider">
            Tỷ Giá Ngoại Tệ
          </CardTitle>
          <span className="text-[0.55rem] text-muted-foreground uppercase tracking-wider">
            Vietcombank
          </span>
        </div>
        <div className="flex items-center text-[0.55rem] text-muted-foreground uppercase tracking-wider mt-1">
          <span className="flex-1">Ngoại tệ</span>
          <span className="w-20 text-right">Mua CK</span>
          <span className="w-20 text-right">Bán</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y divide-border/50">
          {featured.map((rate) => (
            <div
              key={rate.currencyCode}
              className="flex items-center py-1.5 text-sm"
            >
              <div className="flex-1">
                <span className="font-bold text-xs">{rate.currencyCode}</span>
              </div>
              <span className="w-20 text-right font-mono text-xs">
                {parseFloat(rate.buyTransfer).toLocaleString()}
              </span>
              <span className="w-20 text-right font-mono text-xs">
                {parseFloat(rate.sell).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Index Sparkline Card ───────────────────────────────────────
function IndexSparklineCard({
  indices,
  sparklines,
}: {
  indices: IndexSummary[];
  sparklines: IndexSparkline[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display uppercase tracking-wider">
          Chỉ Số Thị Trường
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y divide-border/50">
          {indices.map((idx) => {
            const spark = sparklines.find((s) => s.name === idx.name);
            const color = idx.change > 0 ? "#22c55e" : idx.change < 0 ? "#ef4444" : "#eab308";
            return (
              <div
                key={idx.name}
                className="flex items-center gap-3 py-2.5"
              >
                <div className="w-16 shrink-0">
                  <p className="text-xs font-bold">{idx.name}</p>
                  <p className={`text-[0.6rem] font-mono ${getPriceColor(idx.change)}`}>
                    {idx.changePct > 0 ? "+" : ""}
                    {idx.changePct.toFixed(2)}%
                  </p>
                </div>
                <div className="flex-1">
                  {spark && spark.closes.length >= 2 ? (
                    <Sparkline values={spark.closes} color={color} width={120} height={28} />
                  ) : null}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono font-bold">
                    {idx.value.toFixed(2)}
                  </p>
                  <p className={`text-[0.6rem] font-mono ${getPriceColor(idx.change)}`}>
                    {idx.change > 0 ? "+" : ""}
                    {idx.change.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

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
            <MoversList stocks={filterByExchange(gainers).slice(0, 8)} />
          </TabsContent>
          <TabsContent value="losers">
            <MoversList stocks={filterByExchange(losers).slice(0, 8)} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function MoversList({ stocks }: { stocks: TopStock[] }) {
  return (
    <div className="space-y-1">
      {stocks.map((s) => {
        const price = s.price1DayAgo * 1000;
        const prev = s.price5DaysAgo * 1000;
        const change = prev > 0 ? ((price - prev) / prev) * 100 : 0;
        const color = change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted-foreground";
        return (
          <div key={s.symbol} className="flex items-center justify-between py-1.5 text-sm">
            <div className="flex items-center gap-2">
              <SymbolLink symbol={s.symbol} className="text-sm" />
              <Badge variant="outline" className="text-[0.6rem] px-1 py-0">
                {s.exchange}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
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

function formatGoldPrice(val: number) {
  if (val === 0) return "—";
  if (val > 100000) return (val / 1000000).toFixed(1) + "tr";
  return val.toLocaleString();
}

function GoldMiniCard({ gold }: { gold: GoldPrice[] }) {
  if (!gold || gold.length === 0) return null;
  const items = gold.filter((g: GoldPrice) => g.buy > 0 || g.sell > 0).slice(0, 3);
  if (items.length === 0) return null;

  // Show SJC as main price
  const sjc = items[0];

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
          Vàng SJC
        </p>
        <p className="text-2xl font-display font-bold text-yellow-500">
          {formatGoldPrice(sjc.sell)}
        </p>
        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
          {items.map((g: GoldPrice, i: number) => (
            <div key={i} className="flex justify-between">
              <span className="truncate max-w-[80px]">{g.type_code || `${i + 1}`}</span>
              <span className="font-mono">
                <span className="text-green-500">{formatGoldPrice(g.buy)}</span>
                {" / "}
                <span className="text-red-500">{formatGoldPrice(g.sell)}</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function addOneDay(ddmmyyyy: string): string {
  const m = ddmmyyyy.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return ddmmyyyy;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  d.setDate(d.getDate() + 1);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function FuelPriceCard({ fuelPrices, forecastDate }: { fuelPrices: FuelPrice[]; forecastDate?: string }) {
  if (!fuelPrices || fuelPrices.length === 0) return null;

  const nextDate = forecastDate ? addOneDay(forecastDate) : "";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display uppercase tracking-wider">
          <div className="flex items-center justify-between">
            <span>Dự báo giá xăng dầu</span>
            <a
              href="https://chogia.vn/du-bao-gia-xang-dau-37804/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.6rem] font-normal text-muted-foreground hover:text-foreground"
            >
              chogia.vn
            </a>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-[minmax(0,1fr)_4rem_5.5rem] items-end gap-3 text-[0.6rem] text-muted-foreground pb-2 mb-1 border-b">
          <span className="uppercase tracking-wider">Mặt hàng</span>
          <span className="text-right leading-tight">
            <span className="block">{forecastDate || "Hôm nay"}</span>
            <span className="block text-[0.55rem] opacity-70">USD/thùng</span>
          </span>
          <span className="text-right leading-tight">
            <span className="block">{nextDate || "Ngày mai"}</span>
            <span className="block text-[0.55rem] opacity-70">Dự báo (VND)</span>
          </span>
        </div>
        <div className="space-y-1">
          {fuelPrices.map((fuel, i) => {
            const isUp = fuel.change.toLowerCase().includes("tăng");
            const isDown = fuel.change.toLowerCase().includes("giảm");
            return (
              <div
                key={i}
                className="grid grid-cols-[minmax(0,1fr)_4rem_5.5rem] items-center gap-3 text-sm py-1 border-b last:border-b-0"
              >
                <span className="text-muted-foreground truncate">
                  {fuel.name}
                </span>
                <span className="font-mono text-xs text-right">
                  {fuel.price || "—"}
                </span>
                <span className="flex justify-end">
                  {fuel.change ? (
                    <Badge
                      variant="outline"
                      className={`text-[0.6rem] px-1.5 py-0 whitespace-nowrap ${
                        isUp
                          ? "text-green-500 border-green-500/20"
                          : isDown
                            ? "text-red-500 border-red-500/20"
                            : ""
                      }`}
                    >
                      {isUp && <TrendingUp className="w-2.5 h-2.5 mr-0.5" />}
                      {isDown && <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                      {fuel.change}
                    </Badge>
                  ) : (
                    <span className="text-[0.6rem] text-muted-foreground">—</span>
                  )}
                </span>
              </div>
            );
          })}
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 border-t">
            {latest.map((article, i) => (
              <a
                key={i}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-4 py-3 border-b"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm group-hover:underline line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
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
  fuelPrices,
  fuelForecastDate,
  exchangeRates,
  indexSparklines,
}: {
  indices: IndexSummary[];
  chartData: ChartDataPoint[];
  gainers: TopStock[];
  losers: TopStock[];
  gold: GoldPrice[];
  news: NewsArticle[];
  fuelPrices?: FuelPrice[];
  fuelForecastDate?: string;
  exchangeRates?: ExchangeRate[];
  indexSparklines?: IndexSparkline[];
}) {
  const [selectedIndex] = useState("VNINDEX");
  const [showChart, setShowChart] = useState(true);

  // Load layout preference from localStorage after hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vnstock-layout");
      if (stored === "compact") setShowChart(false);
    } catch {}
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">
          Thị trường
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-sm overflow-hidden">
            <button
              onClick={() => {
                setShowChart(true);
                try { localStorage.setItem("vnstock-layout", "chart"); } catch {}
              }}
              className={`p-1.5 transition-colors ${showChart ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              title="Hiển thị biểu đồ"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setShowChart(false);
                try { localStorage.setItem("vnstock-layout", "compact"); } catch {}
              }}
              className={`p-1.5 transition-colors ${!showChart ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              title="Ẩn biểu đồ"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </p>
        </div>
      </div>

      <StockLookup />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {indices.map((idx) => (
          <IndexCard key={idx.name} index={idx} />
        ))}
        <GoldMiniCard gold={gold} />
      </div>

      {showChart ? (
        /* Layout 1: Chart + Sidebar */
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
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

          <div className="space-y-4">
            <WatchlistPanel />
            {fuelPrices && fuelPrices.length > 0 && (
              <FuelPriceCard fuelPrices={fuelPrices} forecastDate={fuelForecastDate} />
            )}
          </div>
        </div>
      ) : (
        /* Layout 2: No chart — watchlist + market info */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <WatchlistPanel />
          <div className="space-y-4">
            {indexSparklines && indexSparklines.length > 0 && (
              <IndexSparklineCard indices={indices} sparklines={indexSparklines} />
            )}
            {exchangeRates && exchangeRates.length > 0 && (
              <ExchangeRateCard rates={exchangeRates} />
            )}
          </div>
          <div className="space-y-4">
            {fuelPrices && fuelPrices.length > 0 && (
              <FuelPriceCard fuelPrices={fuelPrices} forecastDate={fuelForecastDate} />
            )}
          </div>
        </div>
      )}

      <AcademyPanel />

      <NewsSection news={news} />
    </div>
  );
}
