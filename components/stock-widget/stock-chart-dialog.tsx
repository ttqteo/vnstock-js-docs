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
import { Loader2 } from "lucide-react";
import { StockChart } from "./stock-chart";
import { sma } from "vnstock-js/indicators";
import type { Bar, Quote } from "vnstock-js";
import { fmtMoney } from "@/lib/format";

// Prices from the API routes are dong.
type ChartDataPoint = Bar;
type PriceBoard = Quote;

interface StockInfo {
  priceboard: PriceBoard | null;
  profile: {
    industry: string;
    industryEn: string;
    sector: string;
    companyName: string;
    issuedShares: number;
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shareholders: any[];
  ratios: {
    pe: number | null;
    eps: number | null;
    pb: number | null;
    roe: number | null;
    roa: number | null;
    issueShare: number | null;
    avgVolume2Week: number | null;
  } | null;
}

function getPriceColor(price: number, ref: number, ceiling: number, floor: number) {
  if (ceiling > 0 && price >= ceiling) return "text-purple-600";
  if (floor > 0 && price <= floor) return "text-blue-600";
  if (price > ref) return "text-green-600";
  if (price < ref) return "text-red-600";
  return "text-yellow-500";
}

function getBgPriceColor(price: number, ref: number, ceiling: number, floor: number) {
  if (ceiling > 0 && price >= ceiling) return "bg-purple-600/10";
  if (floor > 0 && price <= floor) return "bg-blue-600/10";
  if (price > ref) return "bg-green-600/10";
  if (price < ref) return "bg-red-600/10";
  return "";
}

function StatRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={`text-sm font-medium tabular-nums ${valueClass || ""}`}>
        {value}
      </span>
    </div>
  );
}

function StatsPanel({ info, chartData }: { info: StockInfo; chartData: ChartDataPoint[] }) {
  const pb = info.priceboard;
  if (!pb) return null;

  const ref = pb.ref;
  const totalValue = pb.value;
  const r = info.ratios;

  // Market cap from ratios issueShare
  const issueShare = r?.issueShare ?? info.profile?.issuedShares ?? 0;
  const marketCap = issueShare > 0 ? (pb.price || pb.ref) * issueShare : 0;

  // Avg volume: prefer API value, fallback to chart calc
  let avgVol = r?.avgVolume2Week ?? 0;
  if (!avgVol && chartData.length > 0) {
    const recent = chartData.slice(-10);
    avgVol = Math.round(recent.reduce((s, d) => s + d.volume, 0) / recent.length);
  }

  return (
    <div className="space-y-0">
      <StatRow
        label="Tham chiếu"
        value={ref.toLocaleString()}
        valueClass="text-yellow-500"
      />
      <StatRow
        label="Mở cửa"
        value={
          chartData.length > 0
            ? chartData[chartData.length - 1].open.toLocaleString()
            : "—"
        }
      />
      <StatRow
        label="Thấp - Cao"
        value={
          <>
            <span className="text-blue-600">
              {pb.low.toLocaleString()}
            </span>
            {" - "}
            <span className="text-purple-600">
              {pb.high.toLocaleString()}
            </span>
          </>
        }
      />
      <StatRow
        label="Khối lượng"
        value={pb.volume.toLocaleString()}
        valueClass="text-yellow-500"
      />
      <StatRow
        label="Giá trị"
        value={totalValue > 0 ? fmtMoney(totalValue) : "—"}
        valueClass="text-green-500"
      />
      {avgVol > 0 && (
        <StatRow label="KLTB" value={avgVol.toLocaleString()} />
      )}
      {marketCap > 0 && (
        <StatRow label="Thị giá vốn" value={fmtMoney(marketCap)} />
      )}
      {issueShare > 0 && (
        <StatRow
          label="Số lượng CPLH"
          value={issueShare.toLocaleString()}
        />
      )}
      {r?.pe != null && r.pe > 0 && (
        <StatRow label="P/E" value={r.pe.toFixed(2)} />
      )}
      {r?.pb != null && r.pb > 0 && (
        <StatRow label="P/B" value={r.pb.toFixed(2)} />
      )}
      {r?.eps != null && r.eps > 0 && (
        <StatRow
          label="EPS"
          value={Math.round(r.eps).toLocaleString()}
        />
      )}
      {r?.roe != null && r.roe > 0 && (
        <StatRow
          label="ROE"
          value={(r.roe * 100).toFixed(2) + "%"}
          valueClass="text-green-500"
        />
      )}
      <StatRow
        label="NN Mua / Bán"
        value={
          <>
            <span className="text-green-500">
              {(pb.foreignBuyVolume ?? 0).toLocaleString()}
            </span>
            {" / "}
            <span className="text-red-500">
              {(pb.foreignSellVolume ?? 0).toLocaleString()}
            </span>
          </>
        }
      />
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
  const [smaData, setSmaData] = useState<{ time: string; sma: number | null }[]>([]);
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

  const pb = stockInfo?.priceboard;
  const price = pb?.price ?? 0;
  const ref = pb?.ref ?? 0;
  const change = ref > 0 ? price - ref : 0;
  const changePct = ref > 0 ? ((change / ref) * 100).toFixed(2) : "0.00";
  const priceColor = pb
    ? getPriceColor(price, ref, pb.ceiling, pb.floor)
    : "";
  const priceBg = pb
    ? getBgPriceColor(price, ref, pb.ceiling, pb.floor)
    : "";

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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-5 pt-5 pb-3 border-b">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl font-bold">
                  {symbol}
                </DialogTitle>
                {pb && (
                  <Badge variant="outline" className="text-xs">
                    {pb.exchange}
                  </Badge>
                )}
              </div>
              {pb && (
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${priceColor}`}>
                    {price.toLocaleString()}
                  </span>
                  <span
                    className={`text-sm font-semibold px-2 py-0.5 rounded ${priceColor} ${priceBg}`}
                  >
                    {change > 0 ? "+" : ""}
                    {change.toFixed(0)} / {change > 0 ? "+" : ""}
                    {changePct}%
                  </span>
                </div>
              )}
            </div>
            {pb?.name && (
              <p className="text-sm text-muted-foreground mt-1">
                {pb.name}
                {stockInfo?.profile?.industry && (
                  <span className="ml-2 text-xs">
                    · {stockInfo.profile.industry}
                  </span>
                )}
              </p>
            )}
          </DialogHeader>

          {loading ? (
            <div className="h-[500px] flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
              <div className="p-4">
                {chartData.length > 0 ? (
                  <StockChart data={chartData} smaData={smaData} />
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    Không có dữ liệu
                  </div>
                )}
              </div>

              {stockInfo && (
                <div className="border-t lg:border-t-0 lg:border-l p-4">
                  <StatsPanel info={stockInfo} chartData={chartData} />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
