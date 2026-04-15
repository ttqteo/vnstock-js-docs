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
  Gauge,
  Star,
  Package,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { stock } from "vnstock-js";
import { MarketTicker } from "@/components/market-ticker";
import Copy from "@/components/markdown/copy";

export const revalidate = 3600;

const FEATURES = [
  {
    icon: Zap,
    label: "REALTIME",
    title: "WebSocket Streaming",
    description:
      "Giá cổ phiếu cập nhật liên tục qua SSI WebSocket. Không cần polling.",
  },
  {
    icon: BarChart3,
    label: "TECHNICALS",
    title: "Chỉ báo kỹ thuật",
    description:
      "SMA, EMA, RSI tích hợp sẵn. Import và dùng ngay, không cần thư viện ngoài.",
  },
  {
    icon: Filter,
    label: "SCREENING",
    title: "Sàng lọc cổ phiếu",
    description: "Lọc theo PE, ROE, vốn hóa. Hỗ trợ HOSE, HNX, UPCOM.",
  },
  {
    icon: Code2,
    label: "TYPESCRIPT",
    title: "Type-safe",
    description:
      "Type đầy đủ cho mọi response. Autocomplete mượt mà trên mọi IDE.",
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

async function fetchGithubStars(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/ttqteo/vnstock-js",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

async function fetchNpmVersion(): Promise<string | null> {
  try {
    const res = await fetch(
      "https://registry.npmjs.org/vnstock-js/latest",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.version === "string" ? data.version : null;
  } catch {
    return null;
  }
}

function formatStars(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default async function Home() {
  const [stars, npmVersion] = await Promise.all([
    fetchGithubStars(),
    fetchNpmVersion(),
  ]);

  let indexData: {
    symbol: string;
    value: number;
    change: number;
    changePct: number;
  }[] = [];
  try {
    const indices = ["VNINDEX", "HNXIndex", "HNXUpcomIndex"] as const;
    const displayNames: Record<string, string> = {
      VNINDEX: "HSX",
      HNXIndex: "HNX",
      HNXUpcomIndex: "UPCOM",
    };
    const results = await Promise.all(
      indices.map((idx) =>
        stock.index({
          index: idx,
          start: new Date(Date.now() - 14 * 86400000)
            .toISOString()
            .split("T")[0],
        }),
      ),
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
      <section className="flex flex-col items-center justify-center text-center px-4 pt-24 pb-20 sm:pt-32 sm:pb-24">
        <div className="flex items-center gap-3 mb-8">
          <Image
            src="/vnstock.png"
            alt="vnstock-js"
            width={56}
            height={56}
            className="rounded-full"
          />
        </div>
        <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-7xl mb-6">
          vnstock-js
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-[550px] mb-4 leading-relaxed">
          Thư viện JavaScript nhanh nhất để truy cập dữ liệu chứng khoán Việt
          Nam. Nhẹ, type-safe, sẵn sàng cho production.
        </p>

        {/* Install command */}
        <div className="flex items-center gap-3 bg-muted pl-8 pr-2 py-2 mb-10 font-mono text-sm dark:bg-accent">
          <Terminal className="w-4 h-4 text-muted-foreground shrink-0" />
          <code>npm install vnstock-js</code>
          <Copy content="npm install vnstock-js" />
        </div>

        {/* CTA buttons */}
        <div className="flex flex-row items-center gap-4">
          <Link
            href={`/docs${page_routes[0].href}`}
            className={buttonVariants({
              className:
                "px-8 font-display font-semibold uppercase tracking-wider",
              size: "lg",
            })}
          >
            Bắt Đầu
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link
            href="/examples"
            className={buttonVariants({
              variant: "outline",
              className:
                "px-8 font-display font-semibold uppercase tracking-wider",
              size: "lg",
            })}
          >
            Xem Ví Dụ
          </Link>
          <Link
            href="https://github.com/ttqteo/vnstock-js"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "gap-2 px-5",
            })}
          >
            <Github className="w-5 h-5" />
            {stars != null && (
              <>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-mono text-sm">{formatStars(stars)}</span>
              </>
            )}
          </Link>
          <Link
            href="https://www.npmjs.com/package/vnstock-js"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "gap-2 px-5",
            })}
          >
            <Package className="w-5 h-5" />
            <span className="font-mono text-sm">
              {npmVersion ? `v${npmVersion}` : "npm"}
            </span>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-20 sm:pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px max-w-5xl mx-auto bg-border dark:bg-white/5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-3 p-6 sm:p-8 bg-background hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <f.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  {f.label}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Built for Speed */}
      <section className="px-4 pb-20 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="w-5 h-5 text-muted-foreground" />
            <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Built for Speed
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-4 uppercase tracking-tight">
            3 dòng code.
            <br />
            Không API key. Không đăng ký.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg">
            Gọi trực tiếp từ server hoặc script. Dữ liệu được chuẩn hóa, có type
            sẵn, sẵn sàng render.
          </p>

          {/* Code block — always dark */}
          <div className="overflow-hidden bg-[#141516] text-[#e5e2e1]">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
              <span className="text-xs text-white/40 font-mono ml-2">
                index.ts
              </span>
            </div>
            <div className="p-5 sm:p-8 overflow-x-auto text-sm leading-relaxed font-mono whitespace-pre">
              {CODE_EXAMPLE}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 pb-24 sm:pb-32">
        <div className="max-w-5xl mx-auto text-center bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a] p-10 sm:p-16">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-4 uppercase tracking-tight">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="mb-8 opacity-60 max-w-md mx-auto">
            Đọc tài liệu, xem ví dụ mẫu với dữ liệu thật, hoặc bắt tay vào code
            ngay.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/docs${page_routes[0].href}`}
              className="inline-flex items-center justify-center px-8 h-11 font-display font-semibold uppercase tracking-wider text-sm bg-white text-[#1a1a1a] dark:bg-[#1a1a1a] dark:text-white hover:opacity-90 transition-opacity"
            >
              Đọc Tài Liệu
            </Link>
            <Link
              href="/examples"
              className="inline-flex items-center justify-center px-8 h-11 font-display font-semibold uppercase tracking-wider text-sm border border-white/30 text-white dark:border-[#1a1a1a]/30 dark:text-[#1a1a1a] hover:opacity-80 transition-opacity"
            >
              Xem Ví Dụ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
