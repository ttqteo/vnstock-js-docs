import { Metadata } from "next";
import { stock } from "vnstock-js";
import { MarketCalendar, CorporateEvent } from "@/components/calendar/market-calendar";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Lịch Sự Kiện — vnstock-js",
  description:
    "Tổng hợp sự kiện quyền, cổ tức, ĐHCĐ sắp diễn ra trên thị trường",
};

// Danh sách mã phổ biến để fetch events
const POPULAR_TICKERS = [
  "VNM",
  "FPT",
  "VCB",
  "HPG",
  "MWG",
  "VHM",
  "VIC",
  "MSN",
  "TCB",
  "MBB",
  "ACB",
  "VPB",
  "STB",
  "TPB",
  "HDB",
  "GAS",
  "PLX",
  "PNJ",
  "REE",
  "DGC",
];

export default async function CalendarPage() {
  // Fetch events cho các mã phổ biến, parallel
  const results = await Promise.allSettled(
    POPULAR_TICKERS.map(async (ticker) => {
      const events = await stock.company({ ticker }).events();
      return events.map((e) => ({ ...e, ticker }));
    })
  );

  const allEvents = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => (r as PromiseFulfilledResult<CorporateEvent[]>).value)
    .sort((a, b) => {
      const dateA = String(a.exRightDate || a.issuedAt || "");
      const dateB = String(b.exRightDate || b.issuedAt || "");
      return dateB.localeCompare(dateA);
    });

  return (
    <div className="sm:container mx-auto w-[95vw] py-8">
      <MarketCalendar events={allEvents} />
    </div>
  );
}
