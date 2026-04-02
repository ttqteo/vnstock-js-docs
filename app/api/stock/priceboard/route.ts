import { stock } from "vnstock-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");
  if (!ticker) {
    return NextResponse.json({ error: "Thiếu mã cổ phiếu" }, { status: 400 });
  }

  try {
    const tickers = ticker.toUpperCase().split(",").filter(Boolean);
    const results = await Promise.all(
      tickers.map((t) => stock.priceBoard({ ticker: t }).then((arr) => arr[0]).catch(() => null))
    );
    return NextResponse.json(results.filter(Boolean));
  } catch {
    return NextResponse.json(
      { error: "Không tìm thấy dữ liệu" },
      { status: 404 }
    );
  }
}
