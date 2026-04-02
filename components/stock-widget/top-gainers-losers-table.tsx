"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SymbolLink } from "./stock-chart-dialog";

interface TopStock {
  symbol: string;
  exchange: string;
  marketCap: number;
  price1DayAgo: number;
  price5DaysAgo: number;
  price20DaysAgo: number;
  vn30: boolean;
  hnx30: boolean;
}

const EXCHANGES = ["HOSE", "HNX", "UPCOM"] as const;

function StockTable({ data, exchange }: { data: TopStock[]; exchange: string }) {
  const filtered = exchange === "ALL" ? data : data.filter((d) => d.exchange === exchange);

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã</TableHead>
            <TableHead>Sàn</TableHead>
            <TableHead className="text-right">Giá 1D</TableHead>
            <TableHead className="text-right">Giá 5D</TableHead>
            <TableHead className="text-right">Giá 20D</TableHead>
            <TableHead className="text-right">Vốn hóa</TableHead>
            <TableHead>Nhóm</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.slice(0, 15).map((item) => (
            <TableRow key={item.symbol}>
              <TableCell><SymbolLink symbol={item.symbol} /></TableCell>
              <TableCell>
                <Badge variant="outline">{item.exchange}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {(item.price1DayAgo * 1000).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {(item.price5DaysAgo * 1000).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {(item.price20DaysAgo * 1000).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {item.marketCap ? item.marketCap.toLocaleString() : "—"}
              </TableCell>
              <TableCell>
                {item.vn30 && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mr-1">VN30</Badge>}
                {item.hnx30 && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">HNX30</Badge>}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function TopGainersLosersTable({
  gainers,
  losers,
}: {
  gainers: TopStock[];
  losers: TopStock[];
}) {
  const [exchange, setExchange] = useState("HOSE");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={exchange === "ALL" ? "default" : "outline"}
          onClick={() => setExchange("ALL")}
        >
          Tất cả
        </Button>
        {EXCHANGES.map((ex) => (
          <Button
            key={ex}
            size="sm"
            variant={exchange === ex ? "default" : "outline"}
            onClick={() => setExchange(ex)}
          >
            {ex}
          </Button>
        ))}
      </div>
      <Tabs defaultValue="gainers">
        <TabsList>
          <TabsTrigger value="gainers">Top Tăng</TabsTrigger>
          <TabsTrigger value="losers">Top Giảm</TabsTrigger>
        </TabsList>
        <TabsContent value="gainers">
          <StockTable data={gainers} exchange={exchange} />
        </TabsContent>
        <TabsContent value="losers">
          <StockTable data={losers} exchange={exchange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
