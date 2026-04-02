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
    const [priceboard, profile, shareholders] = await Promise.allSettled([
      stock.priceBoard({ ticker: symbol }),
      company.profile(),
      company.shareholders(),
    ]);

    const pb =
      priceboard.status === "fulfilled" ? priceboard.value[0] ?? null : null;
    const prof = profile.status === "fulfilled" ? profile.value : null;
    const sh = shareholders.status === "fulfilled" ? shareholders.value : [];

    return NextResponse.json({ priceboard: pb, profile: prof, shareholders: sh });
  } catch {
    return NextResponse.json(
      { error: "Không tìm thấy dữ liệu" },
      { status: 404 }
    );
  }
}
