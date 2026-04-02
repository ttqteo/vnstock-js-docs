import { Metadata } from "next";
import { stock, commodity } from "vnstock-js";
import { FinanceDashboard } from "@/components/finance/finance-dashboard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tài Chính — vnstock-js",
  description: "Tổng quan thị trường chứng khoán Việt Nam",
};

export default async function FinancePage() {
  // Fetch all data in parallel
  const [
    vnindexResult,
    hnxResult,
    upcomResult,
    gainersResult,
    losersResult,
    goldResult,
  ] = await Promise.allSettled([
    stock.index({ index: "VNINDEX", start: daysAgo(90) }),
    stock.index({ index: "HNXIndex", start: daysAgo(7) }),
    stock.index({ index: "HNXUpcomIndex", start: daysAgo(7) }),
    stock.topGainers(),
    stock.topLosers(),
    commodity.gold.priceGiaVangNet(),
  ]);

  const vnindex = vnindexResult.status === "fulfilled" ? vnindexResult.value : [];
  const hnx = hnxResult.status === "fulfilled" ? hnxResult.value : [];
  const upcom = upcomResult.status === "fulfilled" ? upcomResult.value : [];
  const gainers = gainersResult.status === "fulfilled" ? gainersResult.value : [];
  const losers = losersResult.status === "fulfilled" ? losersResult.value : [];
  const gold = goldResult.status === "fulfilled" ? goldResult.value : [];

  // Build index summary cards
  const indices = [
    { name: "VNINDEX", data: vnindex },
    { name: "HNX", data: hnx },
    { name: "UPCOM", data: upcom },
  ].map(({ name, data }) => {
    if (data.length === 0) return { name, value: 0, change: 0, changePct: 0 };
    const latest = data[data.length - 1];
    const prev = data.length > 1 ? data[data.length - 2] : latest;
    const value = latest.close * 1000;
    const prevValue = prev.close * 1000;
    return {
      name,
      value,
      change: value - prevValue,
      changePct: ((value - prevValue) / prevValue) * 100,
    };
  });

  // VNINDEX chart data (last 90 days)
  const chartData = vnindex.map((d) => ({
    date: d.date,
    open: d.open * 1000,
    high: d.high * 1000,
    low: d.low * 1000,
    close: d.close * 1000,
    volume: d.volume,
  }));

  return (
    <FinanceDashboard
      indices={indices}
      chartData={chartData}
      gainers={gainers}
      losers={losers}
      gold={gold}
    />
  );
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString().split("T")[0];
}
