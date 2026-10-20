import { NextRequest, NextResponse } from "next/server";
import { vn } from "@/lib/vnstock";

/** Board row, profile, shareholders and key ratios of one symbol. Money in dong, ratios as fractions. */
export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");
  if (!ticker) {
    return NextResponse.json({ error: "Thiếu mã cổ phiếu" }, { status: 400 });
  }
  const stock = vn.stock(ticker);

  try {
    const [board, profile, shareholders, ratios, bars] = await Promise.allSettled([
      vn.prices([stock.symbol]),
      stock.company(),
      stock.shareholders(),
      stock.financials("ratios", { period: "quarter" }),
      stock.history("1mo"),
    ]);
    const quote = board.status === "fulfilled" ? board.value[0] ?? null : null;
    const prof = profile.status === "fulfilled" ? profile.value : null;
    const rows = ratios.status === "fulfilled" ? ratios.value.rows : [];
    const last: Record<string, number | null> = rows.length ? rows[rows.length - 1].values : {};
    const recent = bars.status === "fulfilled" ? bars.value.slice(-10) : [];
    const price = quote ? quote.price || quote.ref : null;
    const pe = last.pe ?? null;

    return NextResponse.json({
      priceboard: quote,
      profile: prof,
      shareholders: shareholders.status === "fulfilled" ? shareholders.value : [],
      ratios: {
        pe,
        eps: price && pe ? Math.round(price / pe) : null,
        pb: last.pb ?? null,
        roe: last.roe ?? null,
        roa: last.roa ?? null,
        issueShare: prof?.issuedShares ?? null,
        avgVolume2Week: recent.length ? Math.round(recent.reduce((s, b) => s + b.volume, 0) / recent.length) : null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy dữ liệu" }, { status: 404 });
  }
}
