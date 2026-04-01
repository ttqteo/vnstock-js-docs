"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IndicatorData {
  date: string;
  close: number;
  sma20: number | null;
  rsi14: number | null;
}

function getRsiColor(rsi: number): string {
  if (rsi >= 70) return "text-red-600";
  if (rsi <= 30) return "text-green-600";
  return "";
}

function getRsiLabel(rsi: number): string | null {
  if (rsi >= 70) return "Quá mua";
  if (rsi <= 30) return "Quá bán";
  return null;
}

export function IndicatorsCard({
  ticker,
  data,
}: {
  ticker: string;
  data: IndicatorData[];
}) {
  if (!data || data.length === 0) return <div className="text-muted-foreground">Không có dữ liệu</div>;

  // Show last 10 entries
  const display = data.slice(-10);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          Chỉ báo kỹ thuật — {ticker}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[350px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead className="text-right">Giá đóng cửa</TableHead>
                <TableHead className="text-right">SMA(20)</TableHead>
                <TableHead className="text-right">RSI(14)</TableHead>
                <TableHead>Tín hiệu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {display.map((row) => (
                <TableRow key={row.date}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell className="text-right">
                    {(row.close * 1000).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.sma20 != null ? (row.sma20 * 1000).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${row.rsi14 != null ? getRsiColor(row.rsi14) : ""}`}>
                    {row.rsi14 != null ? row.rsi14.toFixed(1) : "—"}
                  </TableCell>
                  <TableCell>
                    {row.rsi14 != null && getRsiLabel(row.rsi14) && (
                      <Badge
                        className={
                          row.rsi14 >= 70
                            ? "bg-rose-100 text-rose-700 hover:bg-rose-100"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        }
                      >
                        {getRsiLabel(row.rsi14)}
                      </Badge>
                    )}
                    {row.sma20 != null && row.close > row.sma20 && (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 ml-1">
                        Trên SMA
                      </Badge>
                    )}
                    {row.sma20 != null && row.close < row.sma20 && (
                      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 ml-1">
                        Dưới SMA
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
