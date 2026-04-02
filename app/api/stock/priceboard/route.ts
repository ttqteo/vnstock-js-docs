import { stock } from "vnstock-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");
  if (!ticker) {
    return NextResponse.json({ error: "Thiếu mã cổ phiếu" }, { status: 400 });
  }

  try {
    const data = await stock.priceBoard({ ticker: ticker.toUpperCase() });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Không tìm thấy dữ liệu" },
      { status: 404 }
    );
  }
}
