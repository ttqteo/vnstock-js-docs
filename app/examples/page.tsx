import { GoldPriceDataTable } from "@/components/stock-widget/gold-price-datatable";
import { IndexPriceCard } from "@/components/stock-widget/index-price-card";
import { StickerRealtimeCard } from "@/components/stock-widget/sticker-realtime-card";
import { TopGainersLosersTable } from "@/components/stock-widget/top-gainers-losers-table";
import { ScreeningTable } from "@/components/stock-widget/screening-table";
import { CompanyProfileCard } from "@/components/stock-widget/company-profile-card";
import { IndicatorsCard } from "@/components/stock-widget/indicators-card";
import { NewsWidget } from "@/components/stock-widget/news-widget";
import { Metadata } from "next";
import { commodity, stock, sma, rsi, VnstockTypes } from "vnstock-js";

export const metadata: Metadata = {
  title: "Ví Dụ",
};

export default async function ExamplesPage() {
  // Gold prices
  const goldPrice = await commodity.gold.priceGiaVangNet();

  // Index data
  const indexPrices = await stock.index({ index: "VNINDEX", start: "2025-06-22" });
  const indexPrices2 = await stock.index({ index: "HNXIndex", start: "2025-06-22" });
  const indexPrices3 = await stock.index({ index: "HNXUpcomIndex", start: "2025-06-22" });

  // Price board + realtime
  const defaultSymbols = ["LPB"];
  const priceboardArr = await stock.priceBoard({ ticker: defaultSymbols.join(",") });
  const initialPriceboard: Record<string, VnstockTypes.PriceBoardItem> = {};
  priceboardArr.forEach((item) => {
    initialPriceboard[item.symbol] = item;
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
        { field: "roe", operator: ">", value: 0.10 },
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
  const history = await stock.quote({ ticker: indicatorTicker, start: "2024-10-01" });
  const sma20 = sma(history, { period: 20 });
  const rsi14 = rsi(history);
  const indicatorData = history.map((h, i) => ({
    date: h.date,
    close: h.close,
    sma20: sma20[i]?.sma ?? null,
    rsi14: rsi14[i]?.rsi ?? null,
  }));

  // News from news-crawler
  let newsArticles: any[] = [];
  try {
    const today = new Date();
    const dateStr = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}-${today.getFullYear()}`;
    const newsRes = await fetch(
      `https://raw.githubusercontent.com/ttqteo/crawl-news/master/docs/news/${dateStr}.json`,
      { next: { revalidate: 3600 } }
    );
    if (newsRes.ok) {
      newsArticles = await newsRes.json();
    }
  } catch {
    // Silently fail - news is optional
  }

  // If today has no news, try yesterday
  if (newsArticles.length === 0) {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = `${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}-${yesterday.getFullYear()}`;
      const newsRes = await fetch(
        `https://raw.githubusercontent.com/ttqteo/crawl-news/master/docs/news/${dateStr}.json`,
        { next: { revalidate: 3600 } }
      );
      if (newsRes.ok) {
        newsArticles = await newsRes.json();
      }
    } catch {}
  }

  return (
    <div className="w-full mx-auto flex flex-col gap-1 sm:min-h-[91vh] min-h-[88vh] pt-2">
      <div className="mb-7 flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold">Ví dụ mẫu</h1>
        <p className="text-muted-foreground">
          Các widget mẫu sử dụng vnstock-js v1.0 — có thể copy code để tích hợp vào dự án.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 grid-cols-1 sm:gap-8 gap-4 mb-5">
        {/* Gold Prices */}
        <div className="grid gap-4 col-span-full">
          <p className="text-lg font-bold">Giá Vàng</p>
          <GoldPriceDataTable goldPrice={goldPrice} />
        </div>

        {/* Index Cards */}
        <div className="grid grid-cols-1 gap-4">
          <p className="text-lg font-bold">Chỉ Số</p>
          <IndexPriceCard data={indexPrices} symbol="VNINDEX" />
          <IndexPriceCard data={indexPrices2} symbol="HNXIndex" />
          <IndexPriceCard data={indexPrices3} symbol="HNXUpcomIndex" />
        </div>

        {/* Realtime */}
        <div className="grid grid-cols-1 gap-4">
          <StickerRealtimeCard
            initialSymbols={defaultSymbols}
            initialPriceboard={initialPriceboard}
          />
        </div>

        {/* Top Gainers/Losers */}
        <div className="grid gap-4 col-span-full">
          <p className="text-lg font-bold">Top Tăng / Giảm</p>
          <TopGainersLosersTable gainers={gainers} losers={losers} />
        </div>

        {/* Screening */}
        <div className="grid gap-4 col-span-full">
          <p className="text-lg font-bold">Sàng Lọc Cổ Phiếu (HOSE, PE &lt; 15, ROE &gt; 10%)</p>
          <ScreeningTable data={screened} />
        </div>

        {/* Company Profile */}
        <div className="grid gap-4">
          <p className="text-lg font-bold">Thông Tin Công Ty — {companyTicker}</p>
          <CompanyProfileCard
            ticker={companyTicker}
            profile={companyProfile}
            shareholders={companyShareholders}
          />
        </div>

        {/* Indicators */}
        <div className="grid gap-4">
          <p className="text-lg font-bold">Chỉ Báo Kỹ Thuật</p>
          <IndicatorsCard ticker={indicatorTicker} data={indicatorData} />
        </div>

        {/* News */}
        <div className="grid gap-4 col-span-full">
          <p className="text-lg font-bold">Tin Tức Tài Chính</p>
          <NewsWidget articles={newsArticles.slice(0, 20)} />
        </div>
      </div>
    </div>
  );
}
