import { GoldPriceDataTable } from "@/components/stock-widget/gold-price-datatable";
import { TopGainersLosersTable } from "@/components/stock-widget/top-gainers-losers-table";
import { ScreeningTable } from "@/components/stock-widget/screening-table";
import { DrawdownChart } from "@/components/stock-widget/drawdown-chart";
import { StockExplorer } from "@/components/stock-widget/stock-explorer";
import { ExampleBlock } from "@/components/example-block";
import { Metadata } from "next";
import { commodity, stock, sma, rsi, Vnstock } from "vnstock-js";

export const metadata: Metadata = {
  title: "Ví Dụ",
};

const CODE_SNIPPETS = {
  goldPrice: `import { commodity } from "vnstock-js";

const goldPrice = await commodity.gold.priceGiaVangNet();`,

  topGainersLosers: `import { stock } from "vnstock-js";

const gainers = await stock.topGainers();
const losers = await stock.topLosers();`,

  screening: `import { stock } from "vnstock-js";

const screened = await stock.screening({
  exchange: "HOSE",
  filters: [
    { field: "pe", operator: "<", value: 15 },
    { field: "roe", operator: ">", value: 0.10 },
  ],
  sortBy: "roe",
  order: "desc",
  limit: 15,
});`,

  drawdown: `import { stock } from "vnstock-js";

const indexData = await stock.index({
  index: "VNINDEX",
  start: "2023-01-01",
});

// Tính drawdown từ đỉnh
let peak = 0;
const drawdownData = indexData.map((d) => {
  if (d.close > peak) peak = d.close;
  const drawdown = ((peak - d.close) / peak) * 100;
  return { date: d.date, close: d.close, drawdown };
});`,

  stockExplorer: `import { stock, sma, rsi, Vnstock } from "vnstock-js";

const ticker = "FPT";

// Biểu đồ giá + SMA
const history = await stock.quote({ ticker, start: "2024-01-01" });
const sma20 = sma(history, { period: 20 });
const rsi14 = rsi(history);

// Thông tin công ty
const company = stock.company({ ticker });
const profile = await company.profile();
const shareholders = await company.shareholders();

// Báo cáo tài chính
const vnstock = new Vnstock();
const { data } = await vnstock.stock.financials
  .incomeStatement({ symbol: ticker, period: "quarter" });`,
};

export default async function ExamplesPage() {
  const goldPrice = await commodity.gold.priceGiaVangNet();

  const gainers = await stock.topGainers();
  const losers = await stock.topLosers();

  let screened: Awaited<ReturnType<typeof stock.screening>> = [];
  try {
    screened = await stock.screening({
      exchange: "HOSE",
      filters: [
        { field: "pe", operator: "<", value: 15 },
        { field: "roe", operator: ">", value: 0.1 },
      ],
      sortBy: "roe",
      order: "desc",
      limit: 15,
    });
  } catch {}

  let drawdownData: { date: string; close: number; drawdown: number }[] = [];
  try {
    const indexData = await stock.index({
      index: "VNINDEX",
      start: "2023-01-01",
    });
    let peak = 0;
    drawdownData = indexData.map((d) => {
      const price = d.close * 1000;
      if (price > peak) peak = price;
      const drawdown = ((peak - price) / peak) * 100;
      return { date: d.date, close: price, drawdown };
    });
  } catch {}

  const explorerTicker = "FPT";
  const explorerHistory = await stock.quote({
    ticker: explorerTicker,
    start: "2024-01-01",
  });
  const explorerSma = sma(explorerHistory, { period: 20 });
  const explorerRsi = rsi(explorerHistory);
  const explorerIndicators = explorerHistory.map((h, i) => ({
    date: h.date,
    close: h.close,
    sma20: explorerSma[i]?.sma ?? null,
    rsi14: explorerRsi[i]?.rsi ?? null,
  }));

  const explorerCompany = stock.company({ ticker: explorerTicker });
  const [explorerProfile, explorerShareholders] = await Promise.all([
    explorerCompany.profile().catch(() => null),
    explorerCompany.shareholders().catch(() => []),
  ]);

  let explorerFinancials: {
    year: number;
    quarter: number;
    revenue: number;
    netProfit: number;
  }[] = [];
  try {
    const vnstock = new Vnstock();
    const result = await vnstock.stock.financials.incomeStatement({
      symbol: explorerTicker,
      period: "quarter",
    });
    if (result?.data && Array.isArray(result.data)) {
      explorerFinancials = result.data
        .filter(
          (f: Record<string, unknown>) =>
            f.year != null && f.quarter != null
        )
        .map((f: Record<string, unknown>) => ({
          year: f.year as number,
          quarter: f.quarter as number,
          revenue: (f.revenue as number) ?? 0,
          netProfit: (f.netProfit as number) ?? (f.netIncome as number) ?? 0,
        }))
        .sort((a, b) => a.year - b.year || a.quarter - b.quarter);
    }
  } catch {}

  return (
    <div className="w-full mx-auto flex flex-col gap-1 sm:min-h-[91vh] min-h-[88vh] pt-2">
      <div className="mb-7 flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold">Ví dụ mẫu</h1>
        <p className="text-muted-foreground">
          Các widget mẫu sử dụng vnstock-js v1.2 — bấm tab{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">Code</code>{" "}
          để xem code và copy.
        </p>
      </div>

      <div className="flex flex-col sm:gap-8 gap-6 mb-5">
        <ExampleBlock title="Top Tăng / Giảm" code={CODE_SNIPPETS.topGainersLosers}>
          <TopGainersLosersTable gainers={gainers} losers={losers} />
        </ExampleBlock>

        <ExampleBlock
          title="Sàng Lọc Cổ Phiếu (HOSE, PE < 15, ROE > 10%)"
          code={CODE_SNIPPETS.screening}
        >
          <ScreeningTable data={screened} />
        </ExampleBlock>

        {drawdownData.length > 0 && (
          <ExampleBlock
            title="VN-Index Drawdown"
            code={CODE_SNIPPETS.drawdown}
          >
            <DrawdownChart data={drawdownData} />
          </ExampleBlock>
        )}

        <ExampleBlock
          title="Tra Cứu Cổ Phiếu"
          code={CODE_SNIPPETS.stockExplorer}
        >
          <StockExplorer
            initialData={{
              ticker: explorerTicker,
              profile: explorerProfile,
              shareholders: explorerShareholders,
              ratios: null,
              chartData: explorerHistory,
              smaData: explorerSma,
              indicators: explorerIndicators,
              financialData: explorerFinancials,
            }}
          />
        </ExampleBlock>

        <ExampleBlock title="Giá Vàng" code={CODE_SNIPPETS.goldPrice}>
          <GoldPriceDataTable goldPrice={goldPrice} />
        </ExampleBlock>
      </div>
    </div>
  );
}
