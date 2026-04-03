import { GoldPriceDataTable } from "@/components/stock-widget/gold-price-datatable";
import { TopGainersLosersTable } from "@/components/stock-widget/top-gainers-losers-table";
import { ScreeningTable } from "@/components/stock-widget/screening-table";
import { CompanySearchCard } from "@/components/stock-widget/company-search-card";
import { IndicatorsCard } from "@/components/stock-widget/indicators-card";
import { ExampleBlock } from "@/components/example-block";
import { Metadata } from "next";
import { commodity, stock, sma, rsi } from "vnstock-js";

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

  companyProfile: `import { stock } from "vnstock-js";

const company = stock.company({ ticker: "VCI" });
const profile = await company.profile();
const shareholders = await company.shareholders();`,

  indicators: `import { stock, sma, rsi } from "vnstock-js";

const history = await stock.quote({
  ticker: "FPT",
  start: "2024-10-01",
});
const sma20 = sma(history, { period: 20 });
const rsi14 = rsi(history);`,
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
  } catch {
    // Screening API may be temporarily unavailable
  }

  const companyTicker = "VCI";
  const company = stock.company({ ticker: companyTicker });
  const companyProfile = await company.profile();
  const companyShareholders = await company.shareholders();

  const indicatorTicker = "FPT";
  const history = await stock.quote({
    ticker: indicatorTicker,
    start: "2024-10-01",
  });
  const sma20 = sma(history, { period: 20 });
  const rsi14 = rsi(history);
  const indicatorData = history.map((h, i) => ({
    date: h.date,
    close: h.close,
    sma20: sma20[i]?.sma ?? null,
    rsi14: rsi14[i]?.rsi ?? null,
  }));

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
        <ExampleBlock title="Giá Vàng" code={CODE_SNIPPETS.goldPrice}>
          <GoldPriceDataTable goldPrice={goldPrice} />
        </ExampleBlock>

        <ExampleBlock title="Top Tăng / Giảm" code={CODE_SNIPPETS.topGainersLosers}>
          <TopGainersLosersTable gainers={gainers} losers={losers} />
        </ExampleBlock>

        <ExampleBlock
          title="Sàng Lọc Cổ Phiếu (HOSE, PE < 15, ROE > 10%)"
          code={CODE_SNIPPETS.screening}
        >
          <ScreeningTable data={screened} />
        </ExampleBlock>

        <ExampleBlock title="Thông Tin Công Ty" code={CODE_SNIPPETS.companyProfile}>
          <CompanySearchCard
            initialData={{
              ticker: companyTicker,
              profile: companyProfile,
              shareholders: companyShareholders,
            }}
          />
        </ExampleBlock>

        <ExampleBlock title="Chỉ Báo Kỹ Thuật" code={CODE_SNIPPETS.indicators}>
          <IndicatorsCard ticker={indicatorTicker} data={indicatorData} />
        </ExampleBlock>
      </div>
    </div>
  );
}
