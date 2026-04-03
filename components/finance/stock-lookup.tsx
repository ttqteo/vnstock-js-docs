"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TickerSearch } from "@/components/stock-widget/ticker-search";
import { StockChart } from "@/components/stock-widget/stock-chart";
import { Star, X, Loader2 } from "lucide-react";
import { sma } from "vnstock-js";

interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceInfo {
  symbol: string;
  companyName: string;
  exchange: string;
  price: number;
  referencePrice: number;
  ceilingPrice: number;
  floorPrice: number;
  highestPrice: number;
  lowestPrice: number;
  totalVolume: number;
  foreignBuyVolume: number;
  foreignSellVolume: number;
}

function getPriceColor(price: number, ref: number, ceiling: number, floor: number) {
  if (ceiling > 0 && price >= ceiling) return "text-purple-600";
  if (floor > 0 && price <= floor) return "text-blue-600";
  if (price > ref) return "text-green-600";
  if (price < ref) return "text-red-600";
  return "text-yellow-500";
}

function PriceInfoPanel({ info }: { info: PriceInfo }) {
  const change = info.referencePrice > 0 ? info.price - info.referencePrice : 0;
  const changePct = info.referencePrice > 0 ? ((change / info.referencePrice) * 100).toFixed(2) : "0.00";
  const color = getPriceColor(info.price, info.referencePrice, info.ceilingPrice, info.floorPrice);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-muted-foreground text-sm truncate max-w-[300px]">{info.companyName}</span>
        <Badge variant="outline">{info.exchange}</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <span className={`text-2xl font-bold ${color}`}>{(info.price * 1000).toLocaleString()}</span>
        <span className={`text-sm font-medium ${color}`}>
          {change > 0 ? "+" : ""}{(change * 1000).toLocaleString()} ({change > 0 ? "+" : ""}{changePct}%)
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Trần</span>
          <span className="text-purple-600 font-medium">{(info.ceilingPrice * 1000).toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Sàn</span>
          <span className="text-blue-600 font-medium">{(info.floorPrice * 1000).toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">TC</span>
          <span className="text-yellow-500 font-medium">{(info.referencePrice * 1000).toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">KL</span>
          <span className="font-medium">{info.totalVolume?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Cao</span>
          <span className="font-medium">{(info.highestPrice * 1000).toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Thấp</span>
          <span className="font-medium">{(info.lowestPrice * 1000).toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">NN Mua</span>
          <span className="font-medium">{info.foreignBuyVolume?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">NN Bán</span>
          <span className="font-medium">{info.foreignSellVolume?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function FavoriteChip({
  symbol,
  price,
  referencePrice,
  ceilingPrice,
  floorPrice,
  onClick,
  onRemove,
}: {
  symbol: string;
  price: number;
  referencePrice: number;
  ceilingPrice: number;
  floorPrice: number;
  onClick: () => void;
  onRemove: () => void;
}) {
  const change = referencePrice > 0 ? price - referencePrice : 0;
  const changePct = referencePrice > 0 ? ((change / referencePrice) * 100).toFixed(2) : "0.00";
  const color = getPriceColor(price, referencePrice, ceilingPrice, floorPrice);

  return (
    <div className="inline-flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 text-sm hover:bg-muted/50 transition-colors">
      <button onClick={onClick} className="flex items-center gap-1.5 cursor-pointer">
        <span className="font-semibold">{symbol}</span>
        {price > 0 && (
          <>
            <span className={`font-mono text-xs ${color}`}>
              {(price * 1000).toLocaleString()}
            </span>
            <span className={`font-mono text-xs ${color}`}>
              {change > 0 ? "+" : ""}{changePct}%
            </span>
          </>
        )}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="text-muted-foreground hover:text-foreground cursor-pointer ml-1"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

const FAVORITES_KEY = "vnstock-favorites";

function loadFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveFavorites(favs: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  } catch {}
}

export function StockLookup() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [smaData, setSmaData] = useState<{ date: string; sma: number | null }[]>([]);
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [favPrices, setFavPrices] = useState<Record<string, PriceInfo>>({});

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const fetchFavoritePrices = useCallback((symbols: string[]) => {
    if (symbols.length === 0) return;
    const tickers = symbols.join(",");
    fetch(`/api/stock/priceboard?ticker=${tickers}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const map: Record<string, PriceInfo> = {};
          data.forEach((item: PriceInfo) => {
            if (item?.symbol) map[item.symbol] = item;
          });
          setFavPrices(map);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchFavoritePrices(favorites);
  }, [favorites, fetchFavoritePrices]);

  const loadSymbol = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
    setLoading(true);
    setChartData([]);
    setSmaData([]);
    setPriceInfo(null);

    Promise.all([
      fetch(`/api/stock/quote?ticker=${symbol}`).then((r) => r.json()),
      fetch(`/api/stock/priceboard?ticker=${symbol}`).then((r) => r.json()).catch(() => []),
    ])
      .then(([quoteData, pbData]) => {
        const arr = Array.isArray(quoteData) ? quoteData : [];
        setChartData(arr);
        if (arr.length > 0) setSmaData(sma(arr, { period: 20 }));
        if (Array.isArray(pbData) && pbData[0]) setPriceInfo(pbData[0]);
      })
      .catch(() => setChartData([]))
      .finally(() => setLoading(false));
  }, []);

  const isFavorite = selectedSymbol ? favorites.includes(selectedSymbol) : false;

  const toggleFavorite = () => {
    if (!selectedSymbol) return;
    let updated: string[];
    if (isFavorite) {
      updated = favorites.filter((s) => s !== selectedSymbol);
    } else {
      updated = [...favorites, selectedSymbol];
    }
    setFavorites(updated);
    saveFavorites(updated);
  };

  const removeFavorite = (symbol: string) => {
    const updated = favorites.filter((s) => s !== symbol);
    setFavorites(updated);
    saveFavorites(updated);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display uppercase tracking-wider">
            Tra cứu cổ phiếu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="max-w-xs flex-1">
              <TickerSearch onSelect={loadSymbol} placeholder="Tìm mã cổ phiếu (VD: FPT, Vinhomes...)" />
            </div>
            {selectedSymbol && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{selectedSymbol}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleFavorite}
                  title={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
                >
                  <Star className={`w-4 h-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                </Button>
              </div>
            )}
          </div>

          {loading && (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Đang tải dữ liệu...
            </div>
          )}

          {!loading && selectedSymbol && (
            <div className="space-y-4">
              {priceInfo && <PriceInfoPanel info={priceInfo} />}
              {chartData.length > 0 ? (
                <StockChart data={chartData} smaData={smaData} />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Không có dữ liệu
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {favorites.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
            Yêu thích
          </h3>
          <div className="flex flex-wrap gap-2">
            {favorites.map((sym) => {
              const p = favPrices[sym];
              return (
                <FavoriteChip
                  key={sym}
                  symbol={sym}
                  price={p?.price ?? 0}
                  referencePrice={p?.referencePrice ?? 0}
                  ceilingPrice={p?.ceilingPrice ?? 0}
                  floorPrice={p?.floorPrice ?? 0}
                  onClick={() => loadSymbol(sym)}
                  onRemove={() => removeFavorite(sym)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
