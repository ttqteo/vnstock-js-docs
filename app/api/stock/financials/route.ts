import { NextRequest, NextResponse } from "next/server";
import { quarterlyIncome } from "@/lib/vnstock";

/** Quarterly revenue and net profit in dong, oldest first: [{ year, quarter, revenue, netProfit }]. */
export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("ticker");
  if (!symbol) {
    return NextResponse.json({ error: "Thiếu mã cổ phiếu" }, { status: 400 });
  }
  try {
    return NextResponse.json(await quarterlyIncome(symbol));
  } catch {
    return NextResponse.json({ error: "Không tìm thấy dữ liệu" }, { status: 404 });
  }
}
