import { NextRequest, NextResponse } from "next/server";
import { vn } from "@/lib/vnstock";

/** Price-board rows (Quote[], money in dong) for comma-separated symbols, in one request. */
export async function GET(request: NextRequest) {
  const symbols = (request.nextUrl.searchParams.get("ticker") || "").toUpperCase().split(",").filter(Boolean);
  if (symbols.length === 0) {
    return NextResponse.json({ error: "Thiếu mã cổ phiếu" }, { status: 400 });
  }
  try {
    const quotes = await vn.prices(symbols);
    return NextResponse.json(quotes.filter((q) => q && q.symbol));
  } catch {
    return NextResponse.json({ error: "Không tìm thấy dữ liệu" }, { status: 404 });
  }
}
