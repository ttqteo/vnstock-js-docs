"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { VnstockTypes } from "vnstock-js";

export function IndexPriceCard({ data, symbol, displayName }: { data: VnstockTypes.QuoteHistory[]; symbol: string; displayName?: string }) {
  if (!data || data.length === 0) return <div>Loading index...</div>;

  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : latest;
  // Prices are divided by 1000 in v1.0, multiply back for index display
  const latestClose = latest.close * 1000;
  const previousClose = previous.close * 1000;
  const change = latestClose - previousClose;
  const changePercent = (change / previousClose) * 100;

  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>{displayName || symbol}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p className="flex gap-2">
          Hiện Tại: <strong>{latestClose.toFixed(2)}</strong>
          <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
            {change >= 0 ? "+" : ""}
            {change.toFixed(2)} ({changePercent.toFixed(2)}%)
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
