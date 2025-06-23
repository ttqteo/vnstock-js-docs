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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { types } from "vnstock-js";

const GOLD_TYPE_MAP: Record<string, string> = {
  BTSJC: "BTMC SJC",
  VNGSJC: "VÀNG VIỆT NAM SJC",
  PQHNVM: "NHẪN TRÒN PHÚ QUÝ 999.9",
  DOHCML: "DOJI HCM",
  DOHNL: "DOJI HN",
  DOJINHTV: "NHẪN DOIJ HƯNG THỊNH VƯỢNG 9999",
  SJ9999: "NHẪN SJC 999.9",
  SJL1L10: "SJC 1 LƯỢNG",
  PQHN24NTT: "NHẪN TRÒN TRƠN VÀNG RỒNG TL BTMC",
  USDX: "USD Index",
  XAUUSD: "Giá vàng thế giới (XAU/USD)",
  BT9999NTT: "NHẪN TRÒN TRƠN VÀNG RỒNG TL BTMC", // giống với PQHN24NTT
  VIETTINMSJC: "VIETINBANK SJC",
  VNGN: "VÀNG DOANH NGHIỆP",
};

const formatPrice = (price: number) => {
  return `${(price / 1000000).toFixed(2)}`;
};

const formatPriceChange = (change: number) => {
  if (change === 0) return null;

  const formattedValue = `${change > 0 ? "+" : "-"}${Math.abs(
    change / 1000
  ).toFixed(0)}K`;

  return {
    value: formattedValue,
    type: change > 0 ? "increase" : "decrease",
  };
};

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

const columns: ColumnDef<types.GoldPriceGiaVangNet>[] = [
  {
    accessorKey: "type_code",
    cell: ({ row }) => {
      const typeCode = row.getValue("type_code") as string;
      return (
        <div className="font-medium">{GOLD_TYPE_MAP[typeCode] ?? typeCode}</div>
      );
    },
  },
  {
    accessorKey: "buy",
    cell: ({ row }) => {
      const buyPrice = row.original.buy;
      const buyChange = formatPriceChange(row.original.alter_buy);

      return (
        <div className="flex items-center justify-center gap-2">
          {formatPrice(buyPrice)}
          {buyChange && (
            <Badge
              className={
                buyChange.type === "increase"
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-700"
                  : "bg-rose-100 text-rose-700 hover:bg-rose-100 hover:text-rose-700"
              }
            >
              {buyChange.value}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "sell",
    cell: ({ row }) => {
      const sellPrice = row.original.sell;
      const sellChange = formatPriceChange(row.original.alter_sell);

      return (
        <div className="flex items-center justify-center gap-2">
          {formatPrice(sellPrice)}
          {sellChange && (
            <Badge
              className={
                sellChange.type === "increase"
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-700"
                  : "bg-rose-100 text-rose-700 hover:bg-rose-100 hover:text-rose-700"
              }
            >
              {sellChange.value}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "yesterday_buy",
    cell: ({ row }) => {
      const yesterdayBuy = row.original.yesterday_buy;

      return (
        <div className="text-center">
          {yesterdayBuy !== null ? formatPrice(yesterdayBuy) : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "yesterday_sell",
    cell: ({ row }) => {
      const yesterdaySell = row.original.yesterday_sell;

      return (
        <div className="text-center">
          {yesterdaySell !== null ? formatPrice(yesterdaySell) : "N/A"}
        </div>
      );
    },
  },
  {
    id: "history",
    header: "Biến động",
    cell: ({ row }) => {
      const typeCode = row.getValue("type_code") as string;
      const histories = row.original.histories;

      if (!histories || histories.length < 2) {
        return <div className="text-center">-</div>;
      }

      const now = new Date();
      const todayKey = `${now.getFullYear()}-${
        now.getMonth() + 1
      }-${now.getDate()}`;
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yesterdayKey = `${yesterday.getFullYear()}-${
        yesterday.getMonth() + 1
      }-${yesterday.getDate()}`;

      const grouped = histories.reduce<
        Record<string, types.GoldPriceGiaVangNet[]>
      >((acc, h) => {
        const key = `${h.create_year}-${h.create_month}-${h.create_day}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(h);
        return acc;
      }, {});

      const latestToday = grouped[todayKey]?.reduce((a, b) =>
        a.update_time > b.update_time ? a : b
      );
      const latestYesterday = grouped[yesterdayKey]?.reduce((a, b) =>
        a.update_time > b.update_time ? a : b
      );

      if (!latestToday || !latestYesterday) {
        return <div className="text-center">-</div>;
      }

      const latestPrice = latestToday.sell;
      const previousPrice = latestYesterday.sell;

      const trend: "up" | "down" | "neutral" =
        latestPrice > previousPrice
          ? "up"
          : latestPrice < previousPrice
          ? "down"
          : "neutral";

      return (
        <div className="flex justify-center">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  {trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  ) : trend === "down" ? (
                    <TrendingDown className="h-4 w-4 text-rose-500" />
                  ) : (
                    <div className="h-4 w-4 flex items-center justify-center">
                      -
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="w-80" side="right">
                <div className="space-y-2">
                  <div className="font-medium">
                    Lịch sử giá {GOLD_TYPE_MAP[typeCode]}
                  </div>
                  <div className="space-y-1">
                    {histories.map((history, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDateTime(history.update_time)}
                        </div>
                        <div className="flex space-x-2">
                          <span>Mua: {formatPrice(history.buy)}</span>
                          <span>Bán: {formatPrice(history.sell)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
];

export function GoldPriceDataTable({
  goldPrice,
}: {
  goldPrice: types.GoldPriceGiaVangNet[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data] = useState<types.GoldPriceGiaVangNet[]>(goldPrice);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    <div className="max-h-[450px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              rowSpan={2}
              className="align-middle text-center border w-[150px]"
            >
              <div>Sản phẩm</div>
              <div className="text-sm font-normal text-muted-foreground">
                Triệu đồng/lượng
              </div>
            </TableHead>
            <TableHead colSpan={2} className="text-center border">
              Hôm nay ({data[0]?.create_day || today.getDate()}/
              {data[0]?.create_month || today.getMonth() + 1}/
              {data[0]?.create_year || today.getFullYear()})
            </TableHead>
            <TableHead colSpan={2} className="text-center border">
              Hôm qua ({yesterday.getDate()}/{yesterday.getMonth() + 1}/
              {yesterday.getFullYear()})
            </TableHead>
            <TableHead rowSpan={2} className="align-middle border text-center">
              <div className="font-bold">Biến động</div>
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="text-center border font-medium">
              Giá mua
            </TableHead>
            <TableHead className="text-center border font-medium">
              Giá bán
            </TableHead>
            <TableHead className="text-center border font-medium">
              Giá mua
            </TableHead>
            <TableHead className="text-center border font-medium">
              Giá bán
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                className={index % 2 === 0 ? "bg-muted/50" : ""}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
