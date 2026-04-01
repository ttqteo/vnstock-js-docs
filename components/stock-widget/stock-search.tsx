"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StockChart } from "./stock-chart";

interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const POPULAR_SYMBOLS = [
  "FPT", "VNM", "MBB", "VCB", "TCB", "HPG", "VHM", "VIC", "MSN", "VRE",
  "SSI", "VCI", "MWG", "PNJ", "ACB", "STB", "TPB", "HDB", "LPB", "VPB",
];

export function StockSearch() {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dialogSymbol, setDialogSymbol] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
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

    fetch(`/api/stock/quote?ticker=${symbol}`)
      .then((res) => res.json())
      .then((data) => setChartData(Array.isArray(data) ? data : []))
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
            <DialogTitle>Biểu đồ giá — {dialogSymbol}</DialogTitle>
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
