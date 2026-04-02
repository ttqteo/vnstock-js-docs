"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
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

interface StockInfo {
  priceboard: {
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
    totalValue: number;
    foreignBuyVolume: number;
    foreignSellVolume: number;
  } | null;
  profile: {
    industry: string;
    sector: string;
  } | null;
}

function getPriceColor(price: number, ref: number, ceiling: number, floor: number) {
  if (ceiling > 0 && price >= ceiling) return "text-purple-600";
  if (floor > 0 && price <= floor) return "text-blue-600";
  if (price > ref) return "text-green-600";
  if (price < ref) return "text-red-600";
  return "text-yellow-500";
}

function StockInfoPanel({ info }: { info: StockInfo }) {
  const pb = info.priceboard;
  if (!pb) return null;

  const price = pb.price;
  const ref = pb.referencePrice;
  const change = ref > 0 ? price - ref : 0;
  const changePct = ref > 0 ? ((change / ref) * 100).toFixed(2) : "0.00";
  const color = getPriceColor(price, ref, pb.ceilingPrice, pb.floorPrice);

  return (
    <div className="space-y-3">
      {/* Header info */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-muted-foreground text-sm truncate max-w-[300px]">
          {pb.companyName}
        </span>
        <Badge variant="outline">{pb.exchange}</Badge>
        {info.profile?.industry && (
          <span className="text-xs text-muted-foreground">{info.profile.industry}</span>
        )}
      </div>

      {/* Price row */}
      <div className="flex flex-wrap items-center gap-4">
        <span className={`text-2xl font-bold ${color}`}>
          {(price * 1000).toLocaleString()}
        </span>
        <span className={`text-sm font-medium ${color}`}>
          {change > 0 ? "+" : ""}{(change * 1000).toLocaleString()} ({change > 0 ? "+" : ""}{changePct}%)
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Trần</span>
          <span className="text-purple-600 font-medium">{(pb.ceilingPrice * 1000).toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Sàn</span>
          <span className="text-blue-600 font-medium">{(pb.floorPrice * 1000).toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">TC</span>
          <span className="text-yellow-500 font-medium">{(ref * 1000).toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">KL</span>
          <span className="font-medium">{pb.totalVolume?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Cao</span>
          <span className="font-medium">{(pb.highestPrice * 1000).toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Thấp</span>
          <span className="font-medium">{(pb.lowestPrice * 1000).toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">NN Mua</span>
          <span className="font-medium">{pb.foreignBuyVolume?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">NN Bán</span>
          <span className="font-medium">{pb.foreignSellVolume?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export function SymbolLink({
  symbol,
  className,
}: {
  symbol: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [smaData, setSmaData] = useState<{ date: string; sma: number | null }[]>([]);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setChartData([]);
    setSmaData([]);
    setStockInfo(null);

    Promise.all([
      fetch(`/api/stock/quote?ticker=${symbol}`).then((r) => r.json()),
      fetch(`/api/stock/info?ticker=${symbol}`).then((r) => r.json()).catch(() => null),
    ])
      .then(([quoteData, infoData]) => {
        const arr = Array.isArray(quoteData) ? quoteData : [];
        setChartData(arr);
        if (arr.length > 0) setSmaData(sma(arr, { period: 20 }));
        if (infoData && !infoData.error) setStockInfo(infoData);
      })
      .catch(() => setChartData([]))
      .finally(() => setLoading(false));
  }, [open, symbol]);

  return (
    <>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setOpen(true)}
              className={`font-medium text-left hover:text-blue-600 hover:underline cursor-pointer ${className || ""}`}
            >
              {symbol}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bấm để xem biểu đồ</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{symbol}</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="h-[500px] flex items-center justify-center text-muted-foreground">
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="space-y-4">
              {stockInfo && <StockInfoPanel info={stockInfo} />}
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
