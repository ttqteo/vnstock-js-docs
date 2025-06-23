"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { types } from "vnstock-js";

export function StockQuoteCard({ data }: { data: types.CompanyOverview }) {
  if (!data) return <div>Loading...</div>;

  const { TickerPriceInfo } = data;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{TickerPriceInfo.ticker.toUpperCase()}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>
          Price: <strong>{TickerPriceInfo.closePrice.toLocaleString()}</strong>
        </p>
        <p
          className={
            TickerPriceInfo.priceChange >= 0 ? "text-green-600" : "text-red-600"
          }
        >
          {TickerPriceInfo.priceChange >= 0 ? "+" : ""}
          {TickerPriceInfo.priceChange.toLocaleString()} (
          {TickerPriceInfo.percentPriceChange.toLocaleString()}%)
        </p>
        <p>Volume: {TickerPriceInfo.totalVolume.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}
