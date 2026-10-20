import { vn } from "./vnstock";
import { fmtMoney, fmtPct, fmtPoints, fmtPrice, fmtVolume } from "./format";

export type ToolCall = { name: string; args: string };

export type ChatTurn = {
  id: string;
  chip: string;
  question: string;
  tools: ToolCall[];
  answer: string[];
  table?: { head: string[]; rows: string[][] };
  note?: string;
};

const TREND_VI = { bullish: "tăng", bearish: "giảm", neutral: "đi ngang" } as const;

async function screenTurn(): Promise<ChatTurn> {
  const rows = await vn.screen({ group: "VN30", where: { pe: { lt: 15 }, roe: { gt: 0.15 } }, sort: "-roe", limit: 5 });
  return {
    id: "screen",
    chip: "Lọc VN30",
    question: "VN30 có mã nào P/E dưới 15 và ROE trên 15% không?",
    tools: [{ name: "screen_stocks", args: `{ group: "VN30", where: { pe: { lt: 15 }, roe: { gt: 0.15 } }, sort: "-roe", limit: 5 }` }],
    answer: rows.length
      ? ["Có. Đây là các mã VN30 thoả cả hai điều kiện, ROE cao nhất trước:"]
      : ["Hiện chưa có mã VN30 nào thoả cả hai điều kiện."],
    table: rows.length
      ? {
          head: ["Mã", "Giá", "P/E", "ROE", "Vốn hoá"],
          rows: rows.map((r) => [
            r.symbol,
            fmtPrice(r.price),
            r.pe == null ? "–" : r.pe.toFixed(1),
            r.roe == null ? "–" : (r.roe * 100).toFixed(1) + "%",
            fmtMoney(r.marketCap),
          ]),
        }
      : undefined,
    note: "P/E, ROE và vốn hoá lấy từ bảng thống kê của nguồn, không tính lại theo giá khớp. Thư viện trả ROE dạng phân số (0.25), ở đây đổi ra phần trăm để đọc.",
  };
}

async function stockTurn(): Promise<ChatTurn> {
  const fpt = vn.stock("FPT");
  const [q, ctx] = await Promise.all([fpt.price(), fpt.context()]);
  const rsi = ctx.indicators.rsi14;
  const support = ctx.levels.support.slice(0, 2).map(fmtPrice).join(", ");
  const resistance = ctx.levels.resistance.slice(0, 2).map(fmtPrice).join(", ");
  return {
    id: "stock",
    chip: "Phân tích FPT",
    question: "FPT hôm nay thế nào?",
    tools: [
      { name: "get_quote", args: `{ symbol: "FPT" }` },
      { name: "get_ai_context", args: `{ symbol: "FPT" }` },
    ],
    answer: [
      `FPT đang ở ${fmtPrice(q.price)} (${fmtPct(q.changePct)}), khớp ${fmtVolume(q.volume)} cổ phiếu, giá trị ${fmtMoney(q.value)}.`,
      `Xu hướng ${TREND_VI[ctx.trend.direction]}, độ mạnh ${Math.round(ctx.trend.strength * 100)}%.${rsi != null ? ` RSI(14) ở ${rsi.toFixed(1)}.` : ""}`,
      [support && `Hỗ trợ gần: ${support}.`, resistance && `Kháng cự gần: ${resistance}.`].filter(Boolean).join(" "),
      `So với 30 phiên trước: ${fmtPct(ctx.performance.change30d)}.`,
    ].filter(Boolean),
    note: `Giá hiển thị theo nghìn đồng như bảng điện; thư viện trả đồng (${q.price}).`,
  };
}

async function marketTurn(): Promise<ChatTurn> {
  const m = await vn.market({ exchange: "HOSE" });
  const liq = m.liquidity.changePercent;
  const net = m.foreign.netValue;
  return {
    id: "market",
    chip: "Thị trường",
    question: "Thị trường hôm nay ra sao?",
    tools: [{ name: "get_market_context", args: `{ exchange: "HOSE" }` }],
    answer: [
      `VN-Index ${fmtPoints(m.index.close)} điểm (${fmtPct(m.index.changePercent)}).`,
      `Thanh khoản HOSE ${fmtMoney(m.liquidity.value)}${liq == null ? "" : `, ${liq >= 0 ? "tăng" : "giảm"} ${Math.abs(liq).toFixed(1)}% so với phiên trước`}.`,
      `Độ rộng: ${m.breadth.advancing} mã tăng, ${m.breadth.declining} mã giảm, ${m.breadth.unchanged} đứng giá.`,
      `Khối ngoại ${net >= 0 ? "mua ròng" : "bán ròng"} ${fmtMoney(Math.abs(net))}.`,
    ],
    note: `Phiên ${m.date}.`,
  };
}

/** Each turn on its own: one failing source drops that turn, not the section. */
export async function buildAgentDemo(): Promise<ChatTurn[]> {
  const settled = await Promise.allSettled([marketTurn(), stockTurn(), screenTurn()]);
  return settled.flatMap((s) => (s.status === "fulfilled" ? [s.value] : []));
}
