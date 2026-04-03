import { stock } from "vnstock-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");
  if (!ticker) {
    return NextResponse.json({ error: "Thiếu mã cổ phiếu" }, { status: 400 });
  }

  const symbol = ticker.toUpperCase();

  try {
    const company = stock.company({ ticker: symbol });
    const [priceboard, profile, shareholders, overview] =
      await Promise.allSettled([
        stock.priceBoard({ ticker: symbol }),
        company.profile(),
        company.shareholders(),
        company.overview(),
      ]);

    const pb =
      priceboard.status === "fulfilled" ? priceboard.value[0] ?? null : null;
    const prof = profile.status === "fulfilled" ? profile.value : null;
    const sh = shareholders.status === "fulfilled" ? shareholders.value : [];

    // Extract financial ratios from overview
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ov = overview.status === "fulfilled" ? (overview.value as any) : null;
    const tickerFR = ov?.TickerPriceInfo?.financialRatio;
    const listingFR = ov?.CompanyListingInfo?.financialRatio;

    const ratios = {
      pe: tickerFR?.pe ?? null,
      eps: tickerFR?.eps ?? null,
      pb: tickerFR?.pb ?? null,
      roe: tickerFR?.roe ?? null,
      roa: tickerFR?.roa ?? null,
      issueShare: listingFR?.issueShare ?? ov?.CompanyListingInfo?.issueShare ?? prof?.issuedShares ?? null,
      avgVolume2Week: ov?.TickerPriceInfo?.averageMatchVolume2Week ?? null,
    };

    return NextResponse.json({
      priceboard: pb,
      profile: prof,
      shareholders: sh,
      ratios,
    });
  } catch {
    return NextResponse.json(
      { error: "Không tìm thấy dữ liệu" },
      { status: 404 }
    );
  }
}
