"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Copy from "@/components/markdown/copy";
import { ChevronDown, ChevronUp, Server, Globe, Zap } from "lucide-react";

const INSTALL_CODE = `npm install vnstock-js`;

const SERVER_CODE = `// app/page.tsx (Next.js Server Component)
import { vn } from "vnstock-js";

export default async function Page() {
  // Giá bằng đồng, nến có \`time\`
  const bars = await vn.stock("FPT").history("6mo");
  const { items: gold } = await vn.gold();

  return <div>{/* render data */}</div>;
}`;

const PROXY_CODE = `// app/api/vnstock/[...path]/route.ts
// Proxy chỉ chuyển tiếp tới máy chủ VietCap theo danh sách đường dẫn cố định
import { nextHandler } from "vnstock-js/proxy";

export const { GET, POST } = nextHandler();`;

const CLIENT_CODE = `// components/stock-widget.tsx
"use client";
import { useEffect, useState } from "react";
import { createClient, type Bar } from "vnstock-js";

// Trình duyệt đi qua proxy vì VCI chặn CORS
const vn = createClient({ proxy: "/api/vnstock" });

export function StockWidget() {
  const [bars, setBars] = useState<Bar[]>([]);

  useEffect(() => {
    vn.stock("FPT").history("3mo").then(setBars);
  }, []);

  return <div>{/* render bars */}</div>;
}`;

const REALTIME_CODE = `// Theo dõi giá trực tiếp
"use client";
import { useEffect } from "react";
import { createClient } from "vnstock-js";

const vn = createClient({ proxy: "/api/vnstock" });

export function LivePrices() {
  useEffect(() => {
    // Mọi watcher của client dùng chung một WebSocket; trả hàm dừng
    const stop = vn.watch(["FPT", "MBB"], (t) => {
      console.log(t.symbol, t.price, t.changePct); // giá bằng đồng, % là phần trăm
    });
    return stop;
  }, []);

  return null;
}`;

const NODE_CODE = `// script.mjs (Node.js 18+)
import { vn } from "vnstock-js";
import { sma, rsi } from "vnstock-js/indicators";

const bars = await vn.stock("FPT").history("1y");
const sma20 = sma(bars, { period: 20 });
const rsi14 = rsi(bars);
console.log(bars.at(-1), sma20.at(-1), rsi14.at(-1));`;

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="relative rounded-lg border bg-muted/50">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-xs text-muted-foreground font-mono">{label}</span>
        <Copy content={code} />
      </div>
      <div className="overflow-x-auto p-4 text-sm font-mono whitespace-pre">
        {code}
      </div>
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
              <p className="text-muted-foreground text-xs">Đi qua proxy vnstock-js/proxy vì VCI chặn CORS</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg border">
            <Zap size={18} className="mt-0.5 shrink-0 text-yellow-500" />
            <div>
              <p className="font-medium">Realtime</p>
              <p className="text-muted-foreground text-xs">vn.watch() qua WebSocket, hoặc mode poll</p>
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
              Gọi trực tiếp trong async Server Component, không bị CORS, data có sẵn khi render.
            </p>
            <CodeBlock code={SERVER_CODE} label="app/page.tsx" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Client</Badge>
              <p className="text-sm font-medium">Client Component qua proxy</p>
            </div>
            <p className="text-sm text-muted-foreground">
              VCI không cho phép CORS. Gắn proxy có sẵn của thư viện vào một route, rồi tạo client với{" "}
              <code className="bg-muted px-1 rounded text-xs">proxy</code> trỏ tới route đó.
            </p>
            <CodeBlock code={PROXY_CODE} label="app/api/vnstock/[...path]/route.ts" />
            <CodeBlock code={CLIENT_CODE} label="components/stock-widget.tsx" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Realtime</Badge>
              <p className="text-sm font-medium">Theo dõi giá với watch()</p>
            </div>
            <p className="text-sm text-muted-foreground">
              <code className="bg-muted px-1 rounded text-xs">vn.watch()</code> mở một WebSocket dùng chung, tự kết nối lại, trả hàm dừng. Trên serverless hoặc khi WebSocket bị chặn, truyền{" "}
              <code className="bg-muted px-1 rounded text-xs">{"{ mode: 'poll' }"}</code> để hỏi bảng giá định kỳ.
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
            <CodeBlock code={NODE_CODE} label="script.mjs" />
          </div>
        </div>
      )}
    </div>
  );
}
