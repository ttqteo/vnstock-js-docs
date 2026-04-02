import { buttonVariants } from "@/components/ui/button";
import { page_routes } from "@/lib/routes-config";
import {
  Zap,
  BarChart3,
  Filter,
  Code2,
  Terminal,
  Github,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { stock } from "vnstock-js";
import { MarketTicker } from "@/components/market-ticker";

const FEATURES = [
  {
    icon: Zap,
    title: "Realtime WebSocket",
    description: "Nhận giá cổ phiếu cập nhật liên tục trong giờ giao dịch",
  },
  {
    icon: BarChart3,
    title: "Chỉ báo kỹ thuật",
    description: "SMA, EMA, RSI tích hợp sẵn — không cần thư viện ngoài",
  },
  {
    icon: Filter,
    title: "Sàng lọc cổ phiếu",
    description: "Lọc theo PE, ROE, vốn hóa và hàng chục chỉ số khác",
  },
  {
    icon: Code2,
    title: "TypeScript",
    description: "Type đầy đủ cho mọi response — autocomplete mượt mà",
  },
];

const CODE_EXAMPLE = `import { stock, sma } from "vnstock-js";

// Lấy giá cổ phiếu FPT
const prices = await stock.quote({
  ticker: "FPT",
  start: "2025-01-01",
});

// Tính SMA 20 ngày
const sma20 = sma(prices, { period: 20 });`;

export default async function Home() {
  let indexData: { symbol: string; value: number; change: number; changePct: number }[] = [];
  try {
    const indices = ["VNINDEX", "HNXIndex", "HNXUpcomIndex"] as const;
    const displayNames: Record<string, string> = { VNINDEX: "HSX", HNXIndex: "HNX", HNXUpcomIndex: "UPCOM" };
    const results = await Promise.all(
      indices.map((idx) => stock.index({ index: idx, start: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0] }))
    );
    indexData = results.map((data, i) => {
      const latest = data[data.length - 1];
      const prev = data.length > 1 ? data[data.length - 2] : latest;
      const value = latest.close * 1000;
      const prevValue = prev.close * 1000;
      return {
        symbol: displayNames[indices[i]] || indices[i],
        value,
        change: value - prevValue,
        changePct: ((value - prevValue) / prevValue) * 100,
      };
    });
  } catch {
    // Silently fail
  }

  return (
    <div className="flex flex-col">
      {/* Market Ticker */}
      {indexData.length > 0 && <MarketTicker data={indexData} />}

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 sm:pt-28 sm:pb-20">
        <div className="flex items-center gap-2 mb-6">
          <Image
            src="/vnstock.png"
            alt="vnstock-js"
            width={48}
            height={48}
            className="rounded-full"
          />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-4">
          vnstock-js
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-[600px] mb-8">
          Thư viện JavaScript lấy dữ liệu chứng khoán Việt Nam.
          <br className="hidden sm:block" />
          Đơn giản, nhanh, có TypeScript.
        </p>

        {/* Install command */}
        <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2.5 mb-8 font-mono text-sm">
          <Terminal className="w-4 h-4 text-muted-foreground shrink-0" />
          <code>npm install vnstock-js</code>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-row items-center gap-4">
          <Link
            href={`/docs${page_routes[0].href}`}
            className={buttonVariants({ className: "px-6", size: "lg" })}
          >
            Bắt Đầu
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link
            href="/examples"
            className={buttonVariants({
              variant: "outline",
              className: "px-6",
              size: "lg",
            })}
          >
            Xem Ví Dụ
          </Link>
          <Link
            href="https://github.com/ttqteo/vnstock-js"
            target="_blank"
            className={buttonVariants({
              variant: "ghost",
              size: "lg",
            })}
          >
            <Github className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Code demo */}
      <section className="px-4 pb-16 sm:pb-20 max-w-3xl mx-auto w-full">
        <div className="rounded-xl border bg-muted/30 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <div className="w-3 h-3 rounded-full bg-green-400/70" />
            </div>
            <span className="text-xs text-muted-foreground font-mono ml-2">
              index.ts
            </span>
          </div>
          <div className="p-4 sm:p-6 overflow-x-auto text-sm leading-relaxed font-mono whitespace-pre">
            {CODE_EXAMPLE}
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          3 dòng code. Không cần API key. Không cần đăng ký.
        </p>
      </section>

      {/* Features */}
      <section className="px-4 pb-16 sm:pb-20">
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex gap-4 p-5 rounded-xl border bg-card hover:border-primary/20 transition-colors"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 pb-20 sm:pb-28">
        <div className="max-w-2xl mx-auto text-center rounded-xl border bg-card p-8 sm:p-12">
          <h2 className="text-2xl font-bold mb-3">Sẵn sàng bắt đầu?</h2>
          <p className="text-muted-foreground mb-6">
            Đọc tài liệu, xem ví dụ mẫu, hoặc bắt tay vào code ngay.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/docs${page_routes[0].href}`}
              className={buttonVariants({ size: "lg", className: "px-6" })}
            >
              Đọc Tài Liệu
            </Link>
            <Link
              href="/examples"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "px-6",
              })}
            >
              Xem Ví Dụ
            </Link>
            <Link
              href="/blog"
              className={buttonVariants({
                variant: "ghost",
                size: "lg",
                className: "px-6",
              })}
            >
              Đọc Blog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
