"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StockChart } from "./stock-chart";
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

const POPULAR_SYMBOLS = [
  "FPT", "VNM", "MBB", "VCB", "TCB", "HPG", "VHM", "VIC", "MSN", "VRE",
  "SSI", "VCI", "MWG", "PNJ", "ACB", "STB", "TPB", "HDB", "LPB", "VPB",
];

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

export function StockSearch() {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dialogSymbol, setDialogSymbol] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [smaData, setSmaData] = useState<{ date: string; sma: number | null }[]>([]);
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const val = input.toUpperCase().trim();
    if (val.length === 0) {
      setSuggestions(POPULAR_SYMBOLS.slice(0, 8));
    } else {
      setSuggestions(
        POPULAR_SYMBOLS.filter((s) => s.includes(val)).slice(0, 8)
      );
    }
  }, [input]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openChart = (symbol: string) => {
    setDialogSymbol(symbol);
    setShowSuggestions(false);
    setInput("");
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
  };

  const handleSubmit = () => {
    const s = input.toUpperCase().trim();
    if (s) openChart(s);
  };

  return (
    <>
      <div ref={wrapperRef} className="relative max-w-xs">
        <Input
          placeholder="Tìm mã cổ phiếu (VD: FPT)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 overflow-hidden">
            <div className="p-2 text-xs text-muted-foreground">
              {input.trim() ? "Kết quả" : "Phổ biến"}
            </div>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => openChart(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
            {input.trim() && !suggestions.some((s) => s === input.toUpperCase().trim()) && (
              <button
                onClick={handleSubmit}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors cursor-pointer text-blue-600"
              >
                Xem biểu đồ &quot;{input.toUpperCase().trim()}&quot;
              </button>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!dialogSymbol} onOpenChange={(open) => !open && setDialogSymbol(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{dialogSymbol}</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="h-[500px] flex items-center justify-center text-muted-foreground">
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="space-y-4">
              {priceInfo && <PriceInfoPanel info={priceInfo} />}
              {chartData.length > 0 ? (
                <StockChart data={chartData} smaData={smaData} />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Không có dữ liệu
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
