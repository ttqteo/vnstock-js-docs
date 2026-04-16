"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, X, RefreshCw } from "lucide-react";
import { SymbolLink } from "@/components/stock-widget/stock-chart-dialog";
import { TickerSearch } from "@/components/stock-widget/ticker-search";
import { VnstockTypes, realtime } from "vnstock-js";

type MarketStatus = "open" | "lunch" | "closed";
type SparkMode = "1D" | "30D";

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
  totalValue: number;
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

function formatVndValue(value: number) {
  if (value <= 0) return "—";
  if (value >= 1e12) return (value / 1e12).toFixed(1) + " nghìn tỷ";
  if (value >= 1e9) return (value / 1e9).toFixed(1) + " tỷ";
  if (value >= 1e6) return (value / 1e6).toFixed(1) + " tr";
  if (value >= 1e3) return (value / 1e3).toFixed(0) + "K";
  return value.toLocaleString();
}

// ── SVG Sparkline ──────────────────────────────────────────────
function MiniSparkline({
  values,
  color,
  width = 56,
  height = 22,
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
  const pad = 1; // 1px padding top/bottom

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

// ── Main Component ─────────────────────────────────────────────
export function WatchlistPanel() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [items, setItems] = useState<Record<string, WatchlistItem>>({});
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [flash, setFlash] = useState<Record<string, "up" | "down" | null>>({});
  const prevPrices = useRef<Record<string, number>>({});

  // Sparkline state
  const [sparkMode, setSparkMode] = useState<SparkMode>("1D");
  // 30D: daily close prices per symbol
  const [spark30D, setSpark30D] = useState<Record<string, number[]>>({});
  // 1D: intraday price ticks per symbol (from realtime quotes)
  const [spark1D, setSpark1D] = useState<Record<string, number[]>>({});

  // Load from localStorage on mount
  useEffect(() => {
    setSymbols(loadSymbols());
    try {
      const stored = localStorage.getItem("vnstock-spark-mode");
      if (stored === "1D" || stored === "30D") setSparkMode(stored);
    } catch {}
    setHydrated(true);
  }, []);

  // ── Fetch priceboard prices ──────────────────────────────────
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const totalVal = ((pb as any).totalValue as number) ?? 0;
            next[pb.symbol] = {
              symbol: pb.symbol,
              price,
              refPrice: ref,
              change,
              changePct,
              ceiling: pb.ceilingPrice ?? 0,
              floor: pb.floorPrice ?? 0,
              volume: pb.totalVolume ?? 0,
              // totalValue from API is in millions VND → convert to VND
              totalValue:
                totalVal > 0
                  ? totalVal * 1e6
                  : price * (pb.totalVolume ?? 0) * 1e6,
            };
          });
          return next;
        });

        // Seed 1D sparkline with current price as first point
        setSpark1D((prev) => {
          const next = { ...prev };
          arr.forEach((pb: VnstockTypes.PriceBoardItem) => {
            const price = pb.price ?? 0;
            if (price > 0 && !next[pb.symbol]?.length) {
              next[pb.symbol] = [price * 1000];
            }
          });
          return next;
        });
      } catch {} finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!hydrated) return;
    fetchPrices(symbols);
    saveSymbols(symbols);
  }, [symbols, fetchPrices, hydrated]);

  // ── Fetch 30D sparkline data ─────────────────────────────────
  const fetch30D = useCallback(async (syms: string[]) => {
    const results: Record<string, number[]> = {};
    await Promise.allSettled(
      syms.map(async (ticker) => {
        const res = await fetch(`/api/stock/quote?ticker=${ticker}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const recent = data.slice(-30);
          results[ticker] = recent.map(
            (d: { close: number }) => d.close * 1000
          );
        }
      })
    );
    setSpark30D((prev) => ({ ...prev, ...results }));
  }, []);

  useEffect(() => {
    if (!hydrated || symbols.length === 0) return;
    fetch30D(symbols);
  }, [symbols, fetch30D, hydrated]);

  // ── Realtime WebSocket ───────────────────────────────────────
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

      // Flash animation
      const prev = prevPrices.current[q.symbol];
      if (prev != null && price !== prev) {
        const dir: "up" | "down" = price > prev ? "up" : "down";
        setFlash((f) => ({ ...f, [q.symbol]: dir }));
        setTimeout(() => {
          setFlash((f) => ({ ...f, [q.symbol]: null }));
        }, 600);
      }
      prevPrices.current[q.symbol] = price;

      // Update price data
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
            totalValue: q.totalValue ?? cur.totalValue,
          },
        };
      });

      // Append to 1D sparkline (cap at 200 points to avoid memory bloat)
      const priceVnd = price * 1000;
      setSpark1D((prev) => {
        const arr = prev[q.symbol] ?? [];
        const next = [...arr, priceVnd];
        if (next.length > 200) next.shift();
        return { ...prev, [q.symbol]: next };
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

  // Pick sparkline data based on mode
  // 1D: use realtime ticks, fallback to 30D if < 2 points (ngoài giờ)
  function getSparkValues(symbol: string): number[] {
    if (sparkMode === "1D") {
      const intraday = spark1D[symbol] ?? [];
      if (intraday.length >= 2) return intraday;
      return spark30D[symbol] ?? [];
    }
    return spark30D[symbol] ?? [];
  }

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
          <div className="flex items-center gap-1">
            {/* Spark mode toggle */}
            {(["1D", "30D"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setSparkMode(mode);
                  try { localStorage.setItem("vnstock-spark-mode", mode); } catch {}
                }}
                className={`px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wider transition-colors ${
                  sparkMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
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
        </div>
        <div className="mt-2">
          <TickerSearch
            onSelect={handleAdd}
            placeholder="Thêm mã (VD: NOS, FPT...)"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center text-[0.6rem] text-muted-foreground uppercase tracking-wider pb-1.5 border-b mb-1">
          <span>Tên / KLGD</span>
          <span className="w-20 text-right">Giá</span>
          <span className="w-14 text-right">%</span>
          <span className="w-5" />
        </div>

        <div className="max-h-[420px] overflow-y-auto divide-y divide-border/50">
          {symbols.map((symbol) => {
            const item = items[symbol];
            const sparkValues = getSparkValues(symbol);
            if (!item) {
              return (
                <div key={symbol} className="flex items-center py-3">
                  <span className="font-medium">
                    <SymbolLink symbol={symbol} className="text-xs" />
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground italic">
                    Đang tải...
                  </span>
                  <button
                    onClick={() => handleRemove(symbol)}
                    className="ml-auto text-muted-foreground hover:text-foreground"
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

            const sparkColor =
              item.change > 0
                ? "#22c55e"
                : item.change < 0
                  ? "#ef4444"
                  : "#eab308";

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
                className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center py-2.5 group hover:bg-muted/50 rounded-sm px-0.5 -mx-0.5 transition-colors ${flashClass}`}
              >
                {/* Left: Name + sparkline + volume */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="shrink-0">
                    <SymbolLink
                      symbol={symbol}
                      className="text-sm font-bold"
                    />
                    <p className="text-[0.6rem] text-muted-foreground leading-tight">
                      KL:{formatVndValue(item.totalValue)}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <MiniSparkline key={`${symbol}-${sparkMode}`} values={sparkValues} color={sparkColor} />
                  </div>
                </div>

                {/* Price */}
                <span
                  className={`w-20 text-right font-mono text-xs tabular-nums ${color}`}
                >
                  {(item.price * 1000).toLocaleString()}
                </span>

                {/* Change % */}
                <span
                  className={`w-14 text-right font-mono text-xs tabular-nums ${color}`}
                >
                  {item.changePct > 0 ? "+" : ""}
                  {item.changePct.toFixed(2)}%
                </span>

                {/* Delete */}
                <button
                  onClick={() => handleRemove(symbol)}
                  className="w-5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
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
