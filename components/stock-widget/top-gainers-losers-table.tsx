"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

function StockTable({ data }: { data: TopStock[] }) {
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
          {data.slice(0, 15).map((item) => (
            <TableRow key={item.symbol}>
              <TableCell className="font-medium">{item.symbol}</TableCell>
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
  return (
    <Tabs defaultValue="gainers">
      <TabsList>
        <TabsTrigger value="gainers">Top Tăng</TabsTrigger>
        <TabsTrigger value="losers">Top Giảm</TabsTrigger>
      </TabsList>
      <TabsContent value="gainers">
        <StockTable data={gainers} />
      </TabsContent>
      <TabsContent value="losers">
        <StockTable data={losers} />
      </TabsContent>
    </Tabs>
  );
}
