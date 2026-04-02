import { StockChart } from "@/components/stock-widget/stock-chart";
import { CompanyProfileCard } from "@/components/stock-widget/company-profile-card";
import { NewsWidget } from "@/components/stock-widget/news-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";
import { stock, sma, rsi } from "vnstock-js";

type Params = Promise<{ symbol: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { symbol } = await params;
  return { title: `${symbol.toUpperCase()} — vnstock-js` };
}

export default async function StockDetailPage({
  params,
}: {
  params: Params;
}) {
  const { symbol } = await params;
  const ticker = symbol.toUpperCase();

  // Fetch all data in parallel
  const [history, priceBoardArr, companyProfile, companyShareholders, financials] =
    await Promise.all([
      stock.quote({ ticker, start: "2024-06-01" }),
      stock.priceBoard({ ticker }).catch(() => []),
      stock
        .company({ ticker })
        .profile()
        .catch(() => null),
      stock
        .company({ ticker })
        .shareholders()
        .catch(() => []),
      stock.financials({ ticker, period: "quarter" }).catch(() => null),
    ]);

  // Calculate indicators
  const sma20 = sma(history, { period: 20 });
  const rsi14 = rsi(history);

  // Current price from price board
  const currentData = priceBoardArr[0];

  // Latest RSI
  const latestRsi = rsi14.filter((r: { rsi: number | null }) => r.rsi !== null).pop();

  // Financial data
  const fd = financials?.data as Record<string, unknown> | null;

  // News for this ticker
  let newsArticles: Array<Record<string, unknown>> = [];
  try {
    const today = new Date();
    const dateStr = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}-${today.getFullYear()}`;
    const newsRes = await fetch(
      `https://raw.githubusercontent.com/ttqteo/crawl-news/master/docs/news/${dateStr}.json`,
      { next: { revalidate: 3600 } }
    );
    if (newsRes.ok) {
      const allNews = await newsRes.json();
      newsArticles = allNews.filter(
        (n: Record<string, unknown>) =>
          (n.title as string)?.toUpperCase().includes(ticker) ||
          (n.summary as string)?.toUpperCase().includes(ticker)
      );
    }
  } catch {
    // silently ignore news fetch errors
  }

  return (
    <div className="flex flex-col items-start justify-center pt-8 pb-10 w-full mx-auto">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold">{ticker}</h1>
          {currentData && (
            <>
              <span className="text-2xl font-bold">
                {(currentData.price * 1000).toLocaleString()} VND
              </span>
              <Badge variant="outline">{currentData.exchange}</Badge>
            </>
          )}
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bieu do gia</CardTitle>
          </CardHeader>
          <CardContent>
            <StockChart data={history} smaData={sma20} />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thong So</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {currentData && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Gia tran</p>
                      <p className="font-medium">
                        {(currentData.ceilingPrice * 1000).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gia san</p>
                      <p className="font-medium">
                        {(currentData.floorPrice * 1000).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gia tham chieu</p>
                      <p className="font-medium">
                        {(currentData.referencePrice * 1000).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Khoi luong</p>
                      <p className="font-medium">
                        {currentData.totalVolume?.toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
                {fd && (
                  <>
                    <div>
                      <p className="text-muted-foreground">P/E</p>
                      <p className="font-medium">
                        {fd.pe != null ? Number(fd.pe).toFixed(1) : "\u2014"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">P/B</p>
                      <p className="font-medium">
                        {fd.pb != null ? Number(fd.pb).toFixed(1) : "\u2014"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ROE</p>
                      <p className="font-medium">
                        {fd.roe != null
                          ? `${(Number(fd.roe) * 100).toFixed(1)}%`
                          : "\u2014"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">EPS</p>
                      <p className="font-medium">
                        {fd.eps != null
                          ? Number(fd.eps).toLocaleString()
                          : "\u2014"}
                      </p>
                    </div>
                  </>
                )}
                {latestRsi && (
                  <div>
                    <p className="text-muted-foreground">RSI(14)</p>
                    <p
                      className={`font-medium ${
                        latestRsi.rsi! >= 70
                          ? "text-red-600"
                          : latestRsi.rsi! <= 30
                            ? "text-green-600"
                            : ""
                      }`}
                    >
                      {latestRsi.rsi!.toFixed(1)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Company Profile */}
          {companyProfile && (
            <CompanyProfileCard
              ticker={ticker}
              profile={companyProfile}
              shareholders={companyShareholders}
            />
          )}
        </div>

        {/* News */}
        {newsArticles.length > 0 && (
          <div>
            <p className="text-lg font-bold mb-3">Tin tuc lien quan</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <NewsWidget articles={newsArticles.slice(0, 10) as any} />
          </div>
        )}
      </div>
    </div>
  );
}
