"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/** vn.gold() row: prices and changes in dong per luong, null when the source lists none. */
interface GoldQuote {
  name: string;
  code: string;
  buy: number | null;
  sell: number | null;
  buyChange: number | null;
  sellChange: number | null;
  updatedAt: string;
}

/** Dong per luong -> million dong per luong: 142000000 -> "142.00". */
const formatPrice = (price: number | null) => (price == null ? "–" : (price / 1e6).toFixed(2));

function ChangeBadge({ change }: { change: number | null }) {
  if (!change) return null;
  const up = change > 0;
  return (
    <Badge
      className={
        up
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-700"
          : "bg-rose-100 text-rose-700 hover:bg-rose-100 hover:text-rose-700"
      }
    >
      {up ? "+" : "-"}
      {Math.abs(change / 1000).toFixed(0)}K
    </Badge>
  );
}

/** "2026-10-20T09:04:00+07:00" -> "09:04 20/10" */
function formatTime(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  return m ? `${m[4]}:${m[5]} ${m[3]}/${m[2]}` : "";
}

export function GoldPriceDataTable({ goldPrice }: { goldPrice: GoldQuote[] }) {
  return (
    <div className="max-h-[450px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="border">
              <div>Sản phẩm</div>
              <div className="text-sm font-normal text-muted-foreground">Triệu đồng/lượng</div>
            </TableHead>
            <TableHead className="border text-center">Giá mua</TableHead>
            <TableHead className="border text-center">Giá bán</TableHead>
            <TableHead className="border text-center">Cập nhật</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goldPrice.length ? (
            goldPrice.map((g, index) => (
              <TableRow key={g.code || g.name} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                <TableCell className="font-medium">{g.name}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    {formatPrice(g.buy)}
                    <ChangeBadge change={g.buyChange} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    {formatPrice(g.sell)}
                    <ChangeBadge change={g.sellChange} />
                  </div>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">{formatTime(g.updatedAt)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Chưa có dữ liệu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
