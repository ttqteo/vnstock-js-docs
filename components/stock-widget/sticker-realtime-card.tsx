"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { realtime } from "vnstock-js";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { VnstockTypes } from "vnstock-js";

type MarketStatus = "realtime" | "lunch" | "closed";

function getMarketStatus(): MarketStatus {
  // Convert to Vietnam time (UTC+7) regardless of client/server locale
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const vn = new Date(utcMs + 7 * 60 * 60000);
  const day = vn.getDay();
  if (day === 0 || day === 6) return "closed";
  const t = vn.getHours() * 60 + vn.getMinutes();
  if (t >= 540 && t <= 690) return "realtime";
  if (t > 690 && t < 780) return "lunch";
  if (t >= 780 && t <= 900) return "realtime";
  return "closed";
}

interface StickerRealtimeCardProps {
  initialSymbols?: string[];
  initialPriceboard?: Record<string, VnstockTypes.PriceBoardItem>;
}

export function StickerRealtimeCard({
  initialSymbols = ["FPT"],
  initialPriceboard = {},
}: StickerRealtimeCardProps) {
  const [symbols, setSymbols] = useState<string[]>(initialSymbols);
  const [input, setInput] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [quotes, setQuotes] = useState<Record<string, any>>({});
  const [priceboard, setPriceboard] =
    useState<Record<string, VnstockTypes.PriceBoardItem | undefined>>(
      initialPriceboard,
    );
  const [mode, setMode] = useState<MarketStatus>(getMarketStatus());
  const clientRef = useRef<ReturnType<typeof realtime.create> | null>(null);

  // Restore favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vnstock-favorites");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSymbols(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save favorites to localStorage whenever symbols change
  useEffect(() => {
    try {
      localStorage.setItem("vnstock-favorites", JSON.stringify(symbols));
    } catch {
      // Ignore storage errors
    }
  }, [symbols]);

  useEffect(() => {
    const check = () => {
      setMode(getMarketStatus());
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (symbols.length === 0) return;
    const missingSymbols = symbols.filter((s) => !priceboard[s]);
    if (missingSymbols.length === 0) return;

    let cancelled = false;
    fetch(`/api/stock/priceboard?ticker=${missingSymbols.join(",")}`)
      .then((res) => res.json())
      .then((arr) => {
        if (cancelled || !Array.isArray(arr)) return;
        setPriceboard((prev) => {
          const next = { ...prev };
          arr.forEach((item: VnstockTypes.PriceBoardItem) => {
            next[item.symbol] = item;
          });
          return next;
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols]);

  useEffect(() => {
    if (mode !== "realtime") return;
    const client = realtime.create({ symbols });
    client.on("quote", (parsed) => {
      if (!parsed?.symbol) return;
      setQuotes((prev) => ({ ...prev, [parsed.symbol]: parsed }));
    });
    client.connect();
    clientRef.current = client;
    return () => client.disconnect();
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
          <Badge
            key={s}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {s}
            <button onClick={() => handleRemoveSymbol(s)} className="ml-1">
              <X size={12} />
            </button>
          </Badge>
        ))}
      </div>

      <div className="mb-2">
        {mode === "realtime" ? (
          <Badge variant="outline" className="text-green-600">
            Dữ liệu realtime
          </Badge>
        ) : mode === "lunch" ? (
          <Badge variant="outline" className="text-orange-500">
            Nghỉ trưa (11:30 - 13:00)
          </Badge>
        ) : (
          <Badge variant="outline" className="text-yellow-600">
            Dữ liệu cuối ngày
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {symbols.map((symbol) => {
          const realtimeQuote = mode === "realtime" ? quotes[symbol] : null;
          const pbQuote = priceboard[symbol];
          const quote = realtimeQuote || pbQuote;

          // Validate realtime price against priceboard bounds (floor-ceiling)
          const ceiling = pbQuote?.ceilingPrice ?? 0;
          const floor = pbQuote?.floorPrice ?? 0;
          const rtPrice = realtimeQuote?.matched?.price ?? 0;
          const isRtPriceValid =
            rtPrice > 0 &&
            ceiling > 0 &&
            floor > 0 &&
            rtPrice >= floor &&
            rtPrice <= ceiling;

          const price = isRtPriceValid ? rtPrice : (pbQuote?.price ?? rtPrice);
          const totalVolume =
            realtimeQuote?.totalVolume ?? pbQuote?.totalVolume ?? 0;

          // Calculate change from referencePrice when available (more reliable)
          const refPrice = pbQuote?.referencePrice ?? 0;
          let change = realtimeQuote?.matched?.change ?? 0;
          let changePercent: string | null = null;

          if (refPrice > 0 && price > 0) {
            change = price - refPrice;
            changePercent = ((change / refPrice) * 100).toFixed(2);
          } else if (realtimeQuote?.matched?.changePercent != null) {
            const pct = realtimeQuote.matched.changePercent * 100;
            if (Math.abs(pct) <= 30) {
              changePercent = pct.toFixed(2);
            }
          }

          // Fallback: priceboard mode with no change info yet, show 0
          if (changePercent == null && price > 0 && quote) {
            changePercent = "0.00";
          }

          // Color based on VN stock market convention
          let colorClass = "text-yellow-500"; // reference (no change)
          if (price > 0 && ceiling > 0 && price >= ceiling) {
            colorClass = "text-purple-600"; // ceiling
          } else if (price > 0 && floor > 0 && price <= floor) {
            colorClass = "text-blue-600"; // floor
          } else if (change > 0) {
            colorClass = "text-green-600"; // up
          } else if (change < 0) {
            colorClass = "text-red-600"; // down
          }

          return (
            <Card key={symbol}>
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{symbol}</span>
                  {changePercent != null ? (
                    <Badge variant="outline" className={colorClass}>
                      {change > 0 ? "+" : ""}
                      {(change * 1000).toFixed(0)} / {change > 0 ? "+" : ""}
                      {changePercent}%
                    </Badge>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {quote ? (
                  <>
                    <div className="flex justify-between">
                      <span>Giá hiện tại:</span>
                      <span className={`font-semibold ${colorClass}`}>
                        {(price * 1000).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tổng KL:</span>
                      <span>{Number(totalVolume).toLocaleString()}</span>
                    </div>
                    {ceiling > 0 && (
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>
                          <span className="text-blue-600">{(floor * 1000).toLocaleString()}</span>
                          {" / "}
                          <span className="text-yellow-500">{(refPrice * 1000).toLocaleString()}</span>
                          {" / "}
                          <span className="text-purple-600">{(ceiling * 1000).toLocaleString()}</span>
                        </span>
                        <span>Sàn / TC / Trần</span>
                      </div>
                    )}
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
