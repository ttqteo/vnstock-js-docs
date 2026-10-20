import { NextRequest, NextResponse } from "next/server";
import { vn } from "@/lib/vnstock";

/** Six months of daily bars (Bar[]: time, prices in dong). */
export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("ticker");
  if (!symbol) {
    return NextResponse.json({ error: "Thiếu mã cổ phiếu" }, { status: 400 });
  }
  try {
    return NextResponse.json(await vn.stock(symbol).history("6mo"));
  } catch {
    return NextResponse.json({ error: "Không tìm thấy dữ liệu" }, { status: 404 });
  }
}
