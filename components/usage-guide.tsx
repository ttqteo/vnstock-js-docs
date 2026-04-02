"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Copy from "@/components/markdown/copy";
import { ChevronDown, ChevronUp, Server, Globe, Zap } from "lucide-react";

const INSTALL_CODE = `npm install vnstock-js`;

const SERVER_CODE = `// app/page.tsx (Next.js Server Component)
import { stock, commodity } from "vnstock-js";

export default async function Page() {
  const history = await stock.quote({ ticker: "FPT", start: "2025-01-01" });
  const goldPrice = await commodity.gold.priceGiaVangNet();

  return <div>{/* render data */}</div>;
}`;

const API_ROUTE_CODE = `// app/api/stock/quote/route.ts (API Route)
import { stock } from "vnstock-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");
  const start = new Date(Date.now() - 180 * 86400000)
    .toISOString().split("T")[0];
  const data = await stock.quote({
    ticker: ticker!.toUpperCase(),
    start,
  });
  return NextResponse.json(data);
}`;

const CLIENT_CODE = `// components/stock-widget.tsx ("use client")
"use client";
import { useEffect, useState } from "react";

export function StockWidget() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Gọi qua API route để tránh CORS
    fetch("/api/stock/quote?ticker=FPT")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{/* render data */}</div>;
}`;

const REALTIME_CODE = `// WebSocket realtime — chạy trực tiếp client-side
"use client";
import { stock } from "vnstock-js";

const { connect, subscribe, parseData } = stock.realtime;
const socket = connect({
  onOpen: () => subscribe(socket, { symbols: ["FPT", "MBB"] }),
  onMessage: (data) => {
    if (typeof data === "string" && data.includes("S#")) {
      const parsed = parseData(data);
      console.log(parsed.symbol, parsed.matched.price);
    }
  },
});`;

const NODE_CODE = `// script.js (Node.js)
const { stock, sma, rsi } = require("vnstock-js");

async function main() {
  const history = await stock.quote({ ticker: "FPT", start: "2025-01-01" });
  const sma20 = sma(history, { period: 20 });
  const rsi14 = rsi(history);
  console.log(history, sma20, rsi14);
}
main();`;

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="relative rounded-lg border bg-muted/50">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-xs text-muted-foreground font-mono">{label}</span>
        <Copy content={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function UsageGuide() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Hướng dẫn sử dụng</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span className="ml-1">{expanded ? "Thu gọn" : "Xem thêm"}</span>
        </Button>
      </div>

      {/* Always visible */}
      <div className="space-y-3">
        <CodeBlock code={INSTALL_CODE} label="Cài đặt" />

        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-start gap-2 p-3 rounded-lg border">
            <Server size={18} className="mt-0.5 shrink-0 text-blue-500" />
            <div>
              <p className="font-medium">Server-side</p>
              <p className="text-muted-foreground text-xs">Next.js Server Component, API Route, Node.js script</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg border">
            <Globe size={18} className="mt-0.5 shrink-0 text-green-500" />
            <div>
              <p className="font-medium">Client-side</p>
              <p className="text-muted-foreground text-xs">Gọi qua API Route proxy do CORS từ SSI</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg border">
            <Zap size={18} className="mt-0.5 shrink-0 text-yellow-500" />
            <div>
              <p className="font-medium">Realtime</p>
              <p className="text-muted-foreground text-xs">WebSocket trực tiếp, không cần proxy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable details */}
      {expanded && (
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Server</Badge>
              <p className="text-sm font-medium">Server Component (khuyên dùng)</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Gọi trực tiếp trong async Server Component — không bị CORS, data có sẵn khi render.
            </p>
            <CodeBlock code={SERVER_CODE} label="app/page.tsx" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Client</Badge>
              <p className="text-sm font-medium">Client Component qua API Route</p>
            </div>
            <p className="text-sm text-muted-foreground">
              API SSI không cho phép CORS. Tạo API Route làm proxy, client gọi qua đó.
            </p>
            <CodeBlock code={API_ROUTE_CODE} label="app/api/stock/quote/route.ts" />
            <CodeBlock code={CLIENT_CODE} label="components/stock-widget.tsx" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Realtime</Badge>
              <p className="text-sm font-medium">WebSocket — chạy trực tiếp client</p>
            </div>
            <p className="text-sm text-muted-foreground">
              WebSocket không bị CORS. Dùng <code className="bg-muted px-1 rounded text-xs">stock.realtime</code> trực tiếp trong client component.
            </p>
            <CodeBlock code={REALTIME_CODE} label="components/realtime.tsx" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Node.js</Badge>
              <p className="text-sm font-medium">Script / Backend thuần</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Dùng trực tiếp không cần framework, phù hợp cho bot, cron job, data pipeline.
            </p>
            <CodeBlock code={NODE_CODE} label="script.js" />
          </div>
        </div>
      )}
    </div>
  );
}
