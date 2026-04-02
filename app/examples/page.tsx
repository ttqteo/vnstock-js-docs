import { GoldPriceDataTable } from "@/components/stock-widget/gold-price-datatable";
import { IndexPriceCard } from "@/components/stock-widget/index-price-card";
import { StickerRealtimeCard } from "@/components/stock-widget/sticker-realtime-card";
import { TopGainersLosersTable } from "@/components/stock-widget/top-gainers-losers-table";
import { ScreeningTable } from "@/components/stock-widget/screening-table";
import { CompanySearchCard } from "@/components/stock-widget/company-search-card";
import { IndicatorsCard } from "@/components/stock-widget/indicators-card";
import { NewsWidget } from "@/components/stock-widget/news-widget";
import { StockSearch } from "@/components/stock-widget/stock-search";
import { ExampleBlock } from "@/components/example-block";
import { UsageGuide } from "@/components/usage-guide";
import { Metadata } from "next";
import { commodity, stock, sma, rsi, VnstockTypes } from "vnstock-js";

export const metadata: Metadata = {
  title: "Ví Dụ",
};

const CODE_SNIPPETS = {
  stockSearch: `import { stock } from "vnstock-js";

// Lấy lịch sử giá 180 ngày
const history = await stock.quote({
  ticker: "FPT",
  start: "2025-01-01",
});`,

  goldPrice: `import { commodity } from "vnstock-js";

const goldPrice = await commodity.gold.priceGiaVangNet();`,

  indexPrice: `import { stock } from "vnstock-js";

const vnindex = await stock.index({
  index: "VNINDEX",
  start: "2025-06-22",
});`,

  realtime: `import { stock } from "vnstock-js";

// Lấy bảng giá
const priceboard = await stock.priceBoard({
  ticker: "MBB,FPT,STB",
});

// Realtime qua WebSocket
const { connect, subscribe, parseData } = stock.realtime;
const socket = connect({
  onOpen: () => subscribe(socket, { symbols: ["FPT"] }),
  onMessage: (data) => {
    if (typeof data === "string" && data.includes("S#")) {
      const parsed = parseData(data);
      console.log(parsed.symbol, parsed.matched.price);
    }
  },
});`,

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

  news: `// Tin tức từ GitHub news-crawler
const res = await fetch(
  "https://raw.githubusercontent.com/ttqteo/crawl-news/master/docs/news/04-02-2026.json"
);
const articles = await res.json();`,
};

export default async function ExamplesPage() {
  // Gold prices
  const goldPrice = await commodity.gold.priceGiaVangNet();

  // Index data
  const indexPrices = await stock.index({
    index: "VNINDEX",
    start: "2025-06-22",
  });
  const indexPrices2 = await stock.index({
    index: "HNXIndex",
    start: "2025-06-22",
  });
  const indexPrices3 = await stock.index({
    index: "HNXUpcomIndex",
    start: "2025-06-22",
  });

  // Price board + realtime
  const defaultSymbols = ["MBB", "FPT", "STB"];
  const priceboardArr = await Promise.all(
    defaultSymbols.map((t) => stock.priceBoard({ ticker: t }).then((arr) => arr[0]).catch(() => null))
  );
  const initialPriceboard: Record<string, VnstockTypes.PriceBoardItem> = {};
  priceboardArr.forEach((item) => {
    if (item) initialPriceboard[item.symbol] = item;
  });

  // Top gainers/losers
  const gainers = await stock.topGainers();
  const losers = await stock.topLosers();

  // Screening
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

  // Company profile
  const companyTicker = "VCI";
  const company = stock.company({ ticker: companyTicker });
  const companyProfile = await company.profile();
  const companyShareholders = await company.shareholders();

  // Indicators
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

  // News from news-crawler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let newsArticles: any[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function fetchNews(dateStr: string): Promise<any[]> {
    const res = await fetch(
      `https://raw.githubusercontent.com/ttqteo/crawl-news/master/docs/news/${dateStr}.json`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    if (Array.isArray(json)) return json;
    if (json && typeof json === "object") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Object.values(json).map((item: any) => ({
        ...item,
        image_url: item.image || item.image_url || "",
        published_timestamp: item.published || item.published_timestamp || "",
      }));
    }
    return [];
  }

  try {
    const today = new Date();
    const dateStr = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}-${today.getFullYear()}`;
    newsArticles = await fetchNews(dateStr);

    // Fallback to yesterday
    if (newsArticles.length === 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yDateStr = `${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}-${yesterday.getFullYear()}`;
      newsArticles = await fetchNews(yDateStr);
    }
  } catch {
    // Silently fail - news is optional
  }

  return (
    <div className="w-full mx-auto flex flex-col gap-1 sm:min-h-[91vh] min-h-[88vh] pt-2">
      <div className="mb-7 flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold">Ví dụ mẫu</h1>
        <p className="text-muted-foreground">
          Các widget mẫu sử dụng vnstock-js v1.0 — bấm tab{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">Code</code>{" "}
          để xem code và copy.
        </p>
        <UsageGuide />
        <StockSearch />
      </div>

      <div className="flex flex-col sm:gap-8 gap-6 mb-5">
        {/* Gold Prices */}
        <ExampleBlock title="Giá Vàng" code={CODE_SNIPPETS.goldPrice}>
          <GoldPriceDataTable goldPrice={goldPrice} />
        </ExampleBlock>

        {/* Index Cards */}
        <ExampleBlock title="Chỉ Số" code={CODE_SNIPPETS.indexPrice}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <IndexPriceCard data={indexPrices} symbol="VNINDEX" displayName="HSX" />
            <IndexPriceCard data={indexPrices2} symbol="HNXIndex" displayName="HNX" />
            <IndexPriceCard data={indexPrices3} symbol="HNXUpcomIndex" displayName="UPCOM" />
          </div>
        </ExampleBlock>

        {/* Realtime */}
        <ExampleBlock title="Dữ Liệu Realtime / Bảng Giá" code={CODE_SNIPPETS.realtime}>
          <StickerRealtimeCard
            initialSymbols={defaultSymbols}
            initialPriceboard={initialPriceboard}
          />
        </ExampleBlock>

        {/* Top Gainers/Losers */}
        <ExampleBlock title="Top Tăng / Giảm" code={CODE_SNIPPETS.topGainersLosers}>
          <TopGainersLosersTable gainers={gainers} losers={losers} />
        </ExampleBlock>

        {/* Screening */}
        <ExampleBlock
          title="Sàng Lọc Cổ Phiếu (HOSE, PE < 15, ROE > 10%)"
          code={CODE_SNIPPETS.screening}
        >
          <ScreeningTable data={screened} />
        </ExampleBlock>

        {/* Company Profile */}
        <ExampleBlock title="Thông Tin Công Ty" code={CODE_SNIPPETS.companyProfile}>
          <CompanySearchCard
            initialData={{
              ticker: companyTicker,
              profile: companyProfile,
              shareholders: companyShareholders,
            }}
          />
        </ExampleBlock>

        {/* Indicators */}
        <ExampleBlock title="Chỉ Báo Kỹ Thuật" code={CODE_SNIPPETS.indicators}>
          <IndicatorsCard ticker={indicatorTicker} data={indicatorData} />
        </ExampleBlock>

        {/* News */}
        <ExampleBlock title="Tin Tức Tài Chính" code={CODE_SNIPPETS.news}>
          <NewsWidget articles={newsArticles.slice(0, 20)} />
        </ExampleBlock>
      </div>
    </div>
  );
}
