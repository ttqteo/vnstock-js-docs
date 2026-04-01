import { stock } from "vnstock-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");
  if (!ticker) {
    return NextResponse.json({ error: "Thiếu mã cổ phiếu" }, { status: 400 });
  }

  try {
    const start = new Date(Date.now() - 180 * 86400000)
      .toISOString()
      .split("T")[0];
    const data = await stock.quote({ ticker: ticker.toUpperCase(), start });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Không tìm thấy dữ liệu" },
      { status: 404 }
    );
  }
}
