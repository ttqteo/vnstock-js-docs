import { vn } from "./vnstock";
import { fmtPoints, fmtPointsChange } from "./format";
import type { TickerItem } from "@/components/market-ticker";

const INDICES = [
  ["VNINDEX", "VN-Index"],
  ["HNXIndex", "HNX"],
  ["HNXUpcomIndex", "UPCOM"],
] as const;

async function indexItem(symbol: string, label: string): Promise<TickerItem> {
  const bars = await vn.index(symbol).history("1mo");
  const last = bars[bars.length - 1];
  const prev = bars.length > 1 ? bars[bars.length - 2] : last;
  const change = last.close - prev.close;
  return {
    label,
    value: fmtPoints(last.close),
    change: fmtPointsChange(change),
    changePct: prev.close ? (change / prev.close) * 100 : null,
  };
}

/** SJC bars, sell price in million dong per luong; BTMC gives no daily change. */
async function goldItem(): Promise<TickerItem> {
  const { items } = await vn.gold();
  const sjc = items.find((i) => /MIẾNG SJC/i.test(i.name) && i.sell != null);
  if (!sjc?.sell) throw new Error("no SJC price");
  return { label: "Vàng SJC", value: (sjc.sell / 1e6).toFixed(1), unit: "tr/lượng" };
}

/** vnstock-js has no crypto; Binance's public 24h ticker is enough for one number. */
async function btcItem(): Promise<TickerItem> {
  const res = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT", { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Binance ${res.status}`);
  const t = (await res.json()) as { lastPrice: string; priceChangePercent: string };
  const price = Number(t.lastPrice);
  const pct = Number(t.priceChangePercent);
  if (!Number.isFinite(price)) throw new Error("bad BTC price");
  return {
    label: "BTC",
    value: price.toLocaleString("en-US", { maximumFractionDigits: 0 }),
    unit: "USD",
    changePct: Number.isFinite(pct) ? pct : null,
  };
}

/** Every item on its own: a source that fails drops its item, not the strip. */
export async function tickerItems(): Promise<TickerItem[]> {
  const settled = await Promise.allSettled([...INDICES.map(([s, l]) => indexItem(s, l)), goldItem(), btcItem()]);
  return settled.flatMap((s) => (s.status === "fulfilled" ? [s.value] : []));
}
