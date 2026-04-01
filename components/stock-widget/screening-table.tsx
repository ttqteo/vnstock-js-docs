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

interface ScreenResult {
  symbol: string;
  companyName: string;
  industry: string;
  exchange: string;
  pe: number;
  pb: number;
  roe: number;
  roa: number;
  marketCap: number;
  price: number;
  volume: number;
  [key: string]: unknown;
}

export function ScreeningTable({ data }: { data: ScreenResult[] }) {
  if (!data || data.length === 0) return <div className="text-muted-foreground">Không có kết quả</div>;

  return (
    <div className="max-h-[450px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã</TableHead>
            <TableHead>Công ty</TableHead>
            <TableHead>Sàn</TableHead>
            <TableHead className="text-right">Giá</TableHead>
            <TableHead className="text-right">P/E</TableHead>
            <TableHead className="text-right">P/B</TableHead>
            <TableHead className="text-right">ROE</TableHead>
            <TableHead className="text-right">Vốn hóa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.symbol}>
              <TableCell className="font-medium">{item.symbol}</TableCell>
              <TableCell className="max-w-[200px] truncate">{item.companyName}</TableCell>
              <TableCell>
                <Badge variant="outline">{item.exchange}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {item.price ? (item.price * 1000).toLocaleString() : "—"}
              </TableCell>
              <TableCell className="text-right">
                {item.pe != null ? item.pe.toFixed(1) : "—"}
              </TableCell>
              <TableCell className="text-right">
                {item.pb != null ? item.pb.toFixed(1) : "—"}
              </TableCell>
              <TableCell className="text-right">
                {item.roe != null ? (
                  <span className={item.roe > 0.15 ? "text-green-600 font-medium" : ""}>
                    {(item.roe * 100).toFixed(1)}%
                  </span>
                ) : "—"}
              </TableCell>
              <TableCell className="text-right">
                {item.marketCap ? item.marketCap.toLocaleString() : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
