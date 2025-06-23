import { GoldPriceDataTable } from "@/components/stock-widget/gold-price-datatable";
import { IndexPriceCard } from "@/components/stock-widget/index-price-card";
import { Metadata } from "next";
import { commodity, stock, types } from "vnstock-js";

export const metadata: Metadata = {
  title: "Ví Dụ",
};

// const symbol = "FPT";

export default async function BlogIndexPage() {
  const goldPrice =
    (await commodity.gold.priceGiaVangNet()) as types.GoldPriceGiaVangNet[];

  // const companyProfile = await stock.company(symbol);

  const indexPrices = await stock.index("VNINDEX", "2025-06-22");
  const indexPrices2 = await stock.index("HNXIndex", "2025-06-22");
  const indexPrices3 = await stock.index("HNXUpcomIndex", "2025-06-22");

  return (
    <div className="w-full mx-auto flex flex-col gap-1 sm:min-h-[91vh] min-h-[88vh] pt-2">
      <div className="mb-7 flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold">Một số ví dụ mẫu</h1>
        <p className="text-muted-foreground">
          Đây là ví dụ cơ bản, tuỳ mọi người tuỳ chỉnh.
        </p>
      </div>
      <div className="grid lg:grid-cols-2 grid-cols-1 sm:gap-8 gap-4 mb-5">
        <div className="grid gap-4 col-span-full">
          <p className="text-lg font-bold">Giá Vàng</p>
          <GoldPriceDataTable goldPrice={goldPrice} />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <p className="text-lg font-bold">Chỉ Số</p>
          <IndexPriceCard data={indexPrices} />
          <IndexPriceCard data={indexPrices2} />
          <IndexPriceCard data={indexPrices3} />
        </div>
        {/* <StockQuoteCard data={companyProfile} /> */}
        {/* <CompanyProfileCard data={companyProfile} /> */}
      </div>
    </div>
  );
}
