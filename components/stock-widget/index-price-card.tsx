"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { VnstockTypes } from "vnstock-js";

export function IndexPriceCard({ data }: { data: VnstockTypes.ChartData[] }) {
  if (!data || data.length === 0) return <div>Loading index...</div>;

  const chartData = data[0];
  const latestIndex = chartData.c[chartData.c.length - 1];
  const previousIndex = chartData.c[chartData.c.length - 2] || latestIndex;
  const changeIndex = latestIndex - previousIndex;
  const changePercent = (changeIndex / previousIndex) * 100;
  const totalValue =
    chartData.accumulatedValue[chartData.accumulatedValue.length - 1];

  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>{chartData.symbol}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p className="flex gap-2">
          Hiện Tại: <strong>{latestIndex.toFixed(2)}</strong>
          <p className={changeIndex >= 0 ? "text-green-600" : "text-red-600"}>
            {changeIndex >= 0 ? "+" : ""}
            {changeIndex.toFixed(2)} ({changePercent.toFixed(2)}%)
          </p>
        </p>
        <p>Tổng Giá Trị: {totalValue.toLocaleString()} VNĐ</p>
      </CardContent>
    </Card>
  );
}
