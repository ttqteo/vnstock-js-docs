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
import { StockChart } from "./stock-chart";

interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setChartData([]);

    fetch(`/api/stock/quote?ticker=${symbol}`)
      .then((res) => res.json())
      .then((data) => {
        setChartData(Array.isArray(data) ? data : []);
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
            <DialogTitle>Biểu đồ giá — {symbol}</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Đang tải dữ liệu...
            </div>
          ) : chartData.length > 0 ? (
            <StockChart data={chartData} />
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Không có dữ liệu
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
