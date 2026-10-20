import { Metadata } from "next";
import { vn } from "@/lib/vnstock";
import { FinanceDashboard } from "@/components/finance/finance-dashboard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tài Chính | vnstock-js",
  description: "Tổng quan thị trường chứng khoán Việt Nam",
};

export default async function FinancePage() {
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

  // Fetch all data in parallel
  const [
    vnindexResult,
    hnxResult,
    upcomResult,
    moversResult,
    goldResult,
    exchangeResult,
  ] = await Promise.allSettled([
    vn.index("VNINDEX").history({ from: daysAgo(90) }),
    vn.index("HNXIndex").history({ from: daysAgo(45) }),
    vn.index("HNXUpcomIndex").history({ from: daysAgo(45) }),
    vn.topMovers({ limit: 20 }),
    vn.gold(),
    vn.fx(),
  ]);

  const vnindex = vnindexResult.status === "fulfilled" ? vnindexResult.value : [];
  const hnx = hnxResult.status === "fulfilled" ? hnxResult.value : [];
  const upcom = upcomResult.status === "fulfilled" ? upcomResult.value : [];
  const gainers = moversResult.status === "fulfilled" ? moversResult.value.gainers : [];
  const losers = moversResult.status === "fulfilled" ? moversResult.value.losers : [];
  // SJC bars first: the gold card headlines the first row.
  const goldItems = goldResult.status === "fulfilled" ? goldResult.value.items : [];
  const gold = [...goldItems.filter((g) => /SJC/i.test(g.name)), ...goldItems.filter((g) => !/SJC/i.test(g.name) && !/^BẠC\s/i.test(g.name))];
  const exchangeRates = exchangeResult.status === "fulfilled" ? exchangeResult.value : [];

  // Build index summary cards
  const indices = [
    { name: "VNINDEX", data: vnindex },
    { name: "HNX", data: hnx },
    { name: "UPCOM", data: upcom },
  ].map(({ name, data }) => {
    if (data.length === 0) return { name, value: 0, change: 0, changePct: 0 };
    const latest = data[data.length - 1];
    const prev = data.length > 1 ? data[data.length - 2] : latest;
    // Index levels are points.
    const value = latest.close;
    const prevValue = prev.close;
    return {
      name,
      value,
      change: value - prevValue,
      changePct: ((value - prevValue) / prevValue) * 100,
    };
  });

  // VNINDEX chart data (last 90 days)
  const chartData = vnindex.map((d) => ({
    date: d.time,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
    volume: d.volume,
  }));

  // Index sparkline data (last 30 days close prices)
  const indexSparklines = [
    { name: "VNINDEX", data: vnindex },
    { name: "HNX", data: hnx },
    { name: "UPCOM", data: upcom },
  ].map(({ name, data }) => ({
    name,
    closes: data.slice(-30).map((d) => d.close),
  }));

  // Fetch fuel price forecast from chogia.vn
  let fuelPrices: { name: string; price: string; change: string }[] = [];
  let fuelForecastDate = "";
  try {
    const fuelRes = await fetch(
      "https://chogia.vn/du-bao-gia-xang-dau-37804/",
      {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
        },
      },
    );
    if (fuelRes.ok) {
      const html = await fuelRes.text();
      const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/);
      if (tableMatch) {
        const rows = tableMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
        if (rows) {
          // Extract forecast date from title row (row 0)
          const titleText = rows[0].replace(/<[^>]*>/g, "").trim();
          const dateMatch = titleText.match(/(\d{2}\/\d{2}\/\d{4})/);
          if (dateMatch) fuelForecastDate = dateMatch[1];

          // Skip header rows (0, 1), parse data rows (2-7)
          for (let i = 2; i <= 7 && i < rows.length; i++) {
            const cells = rows[i].match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g);
            if (cells && cells.length >= 2) {
              const cleaned = cells.map((c) =>
                c.replace(/<[^>]*>/g, "").replace(/&#8211;/g, "–").replace(/&nbsp;/g, "").trim(),
              );
              fuelPrices.push({
                name: cleaned[0],
                price: cleaned[1] || "",
                change: cleaned[2] || "",
              });
            }
          }
        }
      }
    }
  } catch {
    // Silently fail
  }

  // Fetch news
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let newsArticles: any[] = [];
  try {
    const today = new Date();
    const dateStr = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}-${today.getFullYear()}`;
    newsArticles = await fetchNews(dateStr);
    if (newsArticles.length === 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yDateStr = `${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}-${yesterday.getFullYear()}`;
      newsArticles = await fetchNews(yDateStr);
    }
  } catch {
    // Silently fail
  }

  return (
    <FinanceDashboard
      indices={indices}
      chartData={chartData}
      gainers={gainers}
      losers={losers}
      gold={gold}
      news={newsArticles.slice(0, 15)}
      fuelPrices={fuelPrices}
      fuelForecastDate={fuelForecastDate}
      exchangeRates={exchangeRates}
      indexSparklines={indexSparklines}
    />
  );
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString().split("T")[0];
}
