"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Bar } from "vnstock-js";
import { fmtPct, fmtPoints, fmtPointsChange } from "@/lib/format";

export function IndexPriceCard({ data, symbol, displayName }: { data: Bar[]; symbol: string; displayName?: string }) {
  if (!data || data.length === 0) return <div>Loading index...</div>;

  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : latest;
  // Index levels are points.
  const latestClose = latest.close;
  const previousClose = previous.close;
  const change = latestClose - previousClose;
  const changePercent = (change / previousClose) * 100;

  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>{displayName || symbol}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p className="flex gap-2">
          Hiện Tại: <strong>{fmtPoints(latestClose)}</strong>
          <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
            {fmtPointsChange(change)} ({fmtPct(changePercent)})
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
