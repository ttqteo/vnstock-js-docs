"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { stock } from "vnstock-js";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { VnstockTypes } from "vnstock-js";

function isTradingHours() {
  const now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) return false;
  const hour = now.getHours();
  const min = now.getMinutes();
  if ((hour === 9 && min >= 0) || (hour > 9 && hour < 11) || (hour === 11 && min <= 30)) return true;
  if ((hour === 13 && min >= 0) || (hour > 13 && hour < 15) || (hour === 15 && min === 0)) return true;
  return false;
}

interface StickerRealtimeCardProps {
  initialSymbols?: string[];
  initialPriceboard?: Record<string, VnstockTypes.PriceBoardItem>;
}

export function StickerRealtimeCard({
  initialSymbols = ["FPT"],
  initialPriceboard = {},
}: StickerRealtimeCardProps) {
  const { connect, subscribe, parseData } = stock.realtime;
  const [symbols, setSymbols] = useState<string[]>(initialSymbols);
  const [input, setInput] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [quotes, setQuotes] = useState<Record<string, any>>({});
  const [priceboard, setPriceboard] =
    useState<Record<string, VnstockTypes.PriceBoardItem | undefined>>(initialPriceboard);
  const [mode, setMode] = useState<"realtime" | "priceboard">(
    isTradingHours() ? "realtime" : "priceboard"
  );
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const check = () => {
      setMode(isTradingHours() ? "realtime" : "priceboard");
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mode === "priceboard") {
      if (symbols.length === 0) return;
      if (Object.keys(initialPriceboard).length > 0 && symbols.every((s) => initialPriceboard[s])) {
        setPriceboard(initialPriceboard);
        return;
      }
    }
  }, [mode, symbols, initialPriceboard]);

  useEffect(() => {
    if (mode !== "realtime") return;
    const socket = connect({
      onOpen: () => {
        subscribe(socket, { symbols });
      },
      onMessage: (data) => {
        if (typeof data === "string" && data.includes("S#")) {
          const parsed = parseData(data);
          if (!parsed?.symbol) return;
          setQuotes((prev) => ({ ...prev, [parsed.symbol]: parsed }));
        }
      },
    });
    socketRef.current = socket;
    return () => socket?.close?.();
  }, [mode, symbols]);

  useEffect(() => {
    if (mode !== "realtime") return;
    if (socketRef.current?.readyState === 1) {
      subscribe(socketRef.current, { symbols });
    }
  }, [mode, symbols]);

  const handleAddSymbol = () => {
    const s = input.toUpperCase().trim();
    if (s && !symbols.includes(s)) {
      setSymbols([...symbols, s]);
    }
    setInput("");
  };

  const handleRemoveSymbol = (symbol: string) => {
    setSymbols(symbols.filter((s) => s !== symbol));
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex gap-2">
        <Input
          placeholder="Nhập mã cổ phiếu (VD: VNM)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddSymbol()}
        />
        <Button onClick={handleAddSymbol}>Thêm</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {symbols.map((s) => (
          <Badge key={s} variant="secondary" className="flex items-center gap-1">
            {s}
            <button onClick={() => handleRemoveSymbol(s)} className="ml-1">
              <X size={12} />
            </button>
          </Badge>
        ))}
      </div>

      <div className="mb-2">
        {mode === "realtime" ? (
          <Badge variant="outline" className="text-green-600">Dữ liệu realtime</Badge>
        ) : (
          <Badge variant="outline" className="text-yellow-600">Dữ liệu cuối ngày</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {symbols.map((symbol) => {
          const realtimeQuote = mode === "realtime" ? quotes[symbol] : null;
          const pbQuote = priceboard[symbol];
          const quote = realtimeQuote || pbQuote;

          // Unified field access for both realtime and priceboard
          const price = realtimeQuote?.matched?.price ?? pbQuote?.price ?? 0;
          const volume = realtimeQuote?.matched?.volume ?? pbQuote?.matchVolume ?? 0;
          const totalValue = quote?.totalValue ?? 0;
          const change = realtimeQuote?.matched?.change ?? 0;
          const changePercent = realtimeQuote?.matched?.changePercent
            ? (realtimeQuote.matched.changePercent * 100).toFixed(2)
            : null;

          return (
            <Card key={symbol}>
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{symbol}</span>
                  {changePercent ? (
                    <Badge
                      variant="outline"
                      className={change > 0 ? "text-green-600" : "text-red-600"}
                    >
                      {change > 0 ? "+" : ""}{(change * 1000).toFixed(0)} ({changePercent}%)
                    </Badge>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {quote ? (
                  <>
                    <div className="flex justify-between">
                      <span>Giá hiện tại:</span>
                      <span className="font-semibold">{(price * 1000).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Khối lượng:</span>
                      <span>{Number(volume).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Giá trị giao dịch:</span>
                      <span>{Number(totalValue).toLocaleString()} ₫</span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground italic">Đang tải...</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
