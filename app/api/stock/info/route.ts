import { stock } from "vnstock-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");
  if (!ticker) {
    return NextResponse.json({ error: "Thiếu mã cổ phiếu" }, { status: 400 });
  }

  const symbol = ticker.toUpperCase();

  try {
    const [priceboard, profile] = await Promise.allSettled([
      stock.priceBoard({ ticker: symbol }),
      stock.company({ ticker: symbol }).profile(),
    ]);

    const pb =
      priceboard.status === "fulfilled" ? priceboard.value[0] ?? null : null;
    const prof = profile.status === "fulfilled" ? profile.value : null;

    return NextResponse.json({ priceboard: pb, profile: prof });
  } catch {
    return NextResponse.json(
      { error: "Không tìm thấy dữ liệu" },
      { status: 404 }
    );
  }
}
