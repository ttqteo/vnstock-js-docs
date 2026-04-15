"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, X, RefreshCw } from "lucide-react";
import { SymbolLink } from "@/components/stock-widget/stock-chart-dialog";
import { TickerSearch } from "@/components/stock-widget/ticker-search";
import { VnstockTypes, realtime } from "vnstock-js";

type MarketStatus = "open" | "lunch" | "closed";

function getMarketStatus(): MarketStatus {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const vn = new Date(utcMs + 7 * 60 * 60000);
  const day = vn.getDay();
  if (day === 0 || day === 6) return "closed";
  const t = vn.getHours() * 60 + vn.getMinutes();
  if (t >= 540 && t <= 690) return "open";
  if (t > 690 && t < 780) return "lunch";
  if (t >= 780 && t <= 900) return "open";
  return "closed";
}

const STORAGE_KEY = "vnstock-watchlist";
const DEFAULT_SYMBOLS = ["FPT", "VNM", "VCB", "HPG", "MWG"];

function loadSymbols(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_SYMBOLS;
}

function saveSymbols(syms: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(syms));
  } catch {}
}

interface WatchlistItem {
  symbol: string;
  price: number;
  refPrice: number;
  change: number;
  changePct: number;
  ceiling: number;
  floor: number;
  volume: number;
}

function getPriceColor(
  price: number,
  change: number,
  ceiling: number,
  floor: number
) {
  if (price > 0 && ceiling > 0 && price >= ceiling) return "text-purple-600";
  if (price > 0 && floor > 0 && price <= floor) return "text-cyan-600";
  if (change > 0) return "text-green-600";
  if (change < 0) return "text-red-600";
  return "text-yellow-500";
}

export function WatchlistPanel() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [items, setItems] = useState<Record<string, WatchlistItem>>({});
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  // "up" | "down" | null per symbol, cleared after animation
  const [flash, setFlash] = useState<Record<string, "up" | "down" | null>>({});
  const prevPrices = useRef<Record<string, number>>({});

  // Load from localStorage on mount — single source of truth
  useEffect(() => {
    setSymbols(loadSymbols());
    setHydrated(true);
  }, []);

  const fetchPrices = useCallback(
    async (syms: string[]) => {
      if (syms.length === 0) return;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/stock/priceboard?ticker=${syms.join(",")}`
        );
        const arr = await res.json();
        if (!Array.isArray(arr)) return;

        // Detect price changes for flash
        const newFlash: Record<string, "up" | "down" | null> = {};
        arr.forEach((pb: VnstockTypes.PriceBoardItem) => {
          const price = pb.price ?? 0;
          const prev = prevPrices.current[pb.symbol];
          if (prev != null && price !== prev) {
            newFlash[pb.symbol] = price > prev ? "up" : "down";
          }
          prevPrices.current[pb.symbol] = price;
        });

        if (Object.keys(newFlash).length > 0) {
          setFlash((f) => ({ ...f, ...newFlash }));
          setTimeout(() => {
            setFlash((f) => {
              const cleared = { ...f };
              for (const k of Object.keys(newFlash)) cleared[k] = null;
              return cleared;
            });
          }, 600);
        }

        setItems((prev) => {
          const next = { ...prev };
          arr.forEach((pb: VnstockTypes.PriceBoardItem) => {
            const ref = pb.referencePrice ?? 0;
            const price = pb.price ?? 0;
            const change = ref > 0 ? price - ref : 0;
            const changePct = ref > 0 ? (change / ref) * 100 : 0;
            next[pb.symbol] = {
              symbol: pb.symbol,
              price,
              refPrice: ref,
              change,
              changePct,
              ceiling: pb.ceilingPrice ?? 0,
              floor: pb.floorPrice ?? 0,
              volume: pb.totalVolume ?? 0,
            };
          });
          return next;
        });
      } catch {} finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch on mount & when symbols change
  useEffect(() => {
    if (!hydrated) return;
    fetchPrices(symbols);
    saveSymbols(symbols);
  }, [symbols, fetchPrices, hydrated]);

  // Realtime WebSocket: subscribe to watchlist during market hours
  const [marketMode, setMarketMode] = useState<MarketStatus>("closed");
  const [wsLive, setWsLive] = useState(false);
  const clientRef = useRef<ReturnType<typeof realtime.create> | null>(null);
  const prevSymsRef = useRef<string[]>([]);

  useEffect(() => {
    const tick = () => setMarketMode(getMarketStatus());
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!hydrated || marketMode !== "open") return;
    const client = realtime.create({ symbols: [] });
    client.on("connected", () => setWsLive(true));
    client.on("disconnected", () => setWsLive(false));
    client.on("error", (e) => console.error("[watchlist realtime]", e));
    client.on("quote", (q) => {
      if (!q?.symbol) return;
      const price = q.matched?.price ?? 0;
      if (price <= 0) return;
      const prev = prevPrices.current[q.symbol];
      if (prev != null && price !== prev) {
        const dir: "up" | "down" = price > prev ? "up" : "down";
        setFlash((f) => ({ ...f, [q.symbol]: dir }));
        setTimeout(() => {
          setFlash((f) => ({ ...f, [q.symbol]: null }));
        }, 600);
      }
      prevPrices.current[q.symbol] = price;
      setItems((prev) => {
        const cur = prev[q.symbol];
        if (!cur) return prev;
        const ref = cur.refPrice;
        const change = ref > 0 ? price - ref : cur.change;
        const changePct = ref > 0 ? (change / ref) * 100 : cur.changePct;
        return {
          ...prev,
          [q.symbol]: {
            ...cur,
            price,
            change,
            changePct,
            volume: q.totalVolume ?? cur.volume,
          },
        };
      });
    });
    client.connect();
    clientRef.current = client;
    prevSymsRef.current = [];
    return () => {
      client.disconnect();
      clientRef.current = null;
      setWsLive(false);
    };
  }, [hydrated, marketMode]);

  // Subscribe/unsubscribe as watchlist changes
  useEffect(() => {
    const client = clientRef.current;
    if (!client || marketMode !== "open") {
      prevSymsRef.current = symbols;
      return;
    }
    const prev = prevSymsRef.current;
    const added = symbols.filter((s) => !prev.includes(s));
    const removed = prev.filter((s) => !symbols.includes(s));
    if (added.length > 0) client.subscribe(added);
    if (removed.length > 0) client.unsubscribe(removed);
    prevSymsRef.current = symbols;
  }, [symbols, marketMode]);

  const handleAdd = (ticker: string) => {
    const s = ticker.toUpperCase().trim();
    if (s && !symbols.includes(s)) {
      setSymbols((prev) => [...prev, s]);
    }
  };

  const handleRemove = (symbol: string) => {
    setSymbols((prev) => prev.filter((s) => s !== symbol));
    setItems((prev) => {
      const next = { ...prev };
      delete next[symbol];
      return next;
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display uppercase tracking-wider flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" />
            Theo dõi
            {marketMode === "open" && wsLive && (
              <span className="text-[0.55rem] font-normal normal-case tracking-normal text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                live
              </span>
            )}
            {marketMode === "open" && !wsLive && (
              <span className="text-[0.55rem] font-normal normal-case tracking-normal text-yellow-500">
                đang kết nối...
              </span>
            )}
            {marketMode === "lunch" && (
              <span className="text-[0.55rem] font-normal normal-case tracking-normal text-muted-foreground">
                nghỉ trưa
              </span>
            )}
            {marketMode === "closed" && (
              <span className="text-[0.55rem] font-normal normal-case tracking-normal text-muted-foreground">
                ngoài giờ
              </span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => fetchPrices(symbols)}
            disabled={loading}
          >
            <RefreshCw
              className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        <div className="mt-2">
          <TickerSearch
            onSelect={handleAdd}
            placeholder="Thêm mã (VD: NOS, FPT...)"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center text-[0.6rem] text-muted-foreground uppercase tracking-wider pb-1.5 border-b mb-1">
          <span className="flex-1">Mã</span>
          <span className="w-16 text-right">Giá</span>
          <span className="w-16 text-right">%</span>
          <span className="w-16 text-right hidden sm:block">KL</span>
          <span className="w-5" />
        </div>

        <div className="space-y-0.5 max-h-[360px] overflow-y-auto">
          {symbols.map((symbol) => {
            const item = items[symbol];
            if (!item) {
              return (
                <div
                  key={symbol}
                  className="flex items-center py-1.5 text-sm"
                >
                  <span className="flex-1 font-medium">
                    <SymbolLink symbol={symbol} className="text-xs" />
                  </span>
                  <span className="text-xs text-muted-foreground italic">
                    Đang tải...
                  </span>
                  <button
                    onClick={() => handleRemove(symbol)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            }

            const color = getPriceColor(
              item.price,
              item.change,
              item.ceiling,
              item.floor
            );

            const fl = flash[symbol];
            const flashClass =
              fl === "up"
                ? "animate-flash-up"
                : fl === "down"
                  ? "animate-flash-down"
                  : "";

            return (
              <div
                key={symbol}
                className={`flex items-center py-1.5 text-sm group hover:bg-muted/50 rounded-sm px-0.5 -mx-0.5 transition-colors ${flashClass}`}
              >
                <span className="flex-1 font-medium">
                  <SymbolLink symbol={symbol} className="text-xs" />
                </span>
                <span className={`w-16 text-right font-mono text-xs ${color}`}>
                  {(item.price * 1000).toLocaleString()}
                </span>
                <span
                  className={`w-16 text-right font-mono text-xs ${color}`}
                >
                  {item.changePct > 0 ? "+" : ""}
                  {item.changePct.toFixed(2)}%
                </span>
                <span className="w-16 text-right font-mono text-xs text-muted-foreground hidden sm:block">
                  {item.volume > 1e6
                    ? (item.volume / 1e6).toFixed(1) + "M"
                    : item.volume > 1e3
                      ? (item.volume / 1e3).toFixed(0) + "K"
                      : item.volume.toLocaleString()}
                </span>
                <button
                  onClick={() => handleRemove(symbol)}
                  className="ml-1 w-5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {hydrated && symbols.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Thêm mã cổ phiếu để theo dõi
          </p>
        )}

        {symbols.length > 0 && (
          <div className="flex gap-3 mt-3 pt-2 border-t text-[0.55rem] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              Trần
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
              Tăng
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              TC
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              Giảm
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
              Sàn
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
