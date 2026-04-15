import { buttonVariants } from "@/components/ui/button";
import { page_routes } from "@/lib/routes-config";
import {
  Zap,
  BarChart3,
  Filter,
  Code2,
  Terminal,
  ArrowRight,
  Gauge,
  Star,
  Package,
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.25.72-1.54-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.58.23 2.75.12 3.04.73.81 1.18 1.84 1.18 3.1 0 4.43-2.71 5.41-5.28 5.69.41.36.78 1.05.78 2.12v3.15c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}
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
      <section className="flex flex-col items-center justify-center text-center px-4 pt-12 pb-16 sm:pt-32 sm:pb-24">
        <div className="flex items-center gap-3 mb-8">
          <Image
            src="/vnstock.png"
            alt="vnstock-js"
            width={56}
            height={56}
            className="rounded-full"
          />
        </div>
        <h1 className="font-display text-4xl sm:text-7xl font-extrabold tracking-tight mb-6">
          vnstock-js
        </h1>
        <p className="text-base sm:text-xl text-muted-foreground max-w-[550px] mb-4 leading-relaxed px-2">
          Thư viện JavaScript nhanh nhất để truy cập dữ liệu chứng khoán Việt
          Nam. Nhẹ, type-safe, sẵn sàng cho production.
        </p>

        {/* Install command */}
        <div className="flex items-center gap-2 sm:gap-3 bg-muted pl-4 sm:pl-8 pr-2 py-2 mb-10 font-mono text-xs sm:text-sm dark:bg-accent max-w-full">
          <Terminal className="w-4 h-4 text-muted-foreground shrink-0" />
          <code className="truncate">npm install vnstock-js</code>
          <Copy content="npm install vnstock-js" />
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md sm:max-w-none sm:w-auto">
          <Link
            href={`/docs${page_routes[0].href}`}
            className={buttonVariants({
              className:
                "px-8 font-display font-semibold uppercase tracking-wider group",
              size: "lg",
            })}
          >
            Bắt Đầu
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
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
        </div>

        {/* Meta links: GitHub stars + npm version */}
        <div className="flex items-center gap-5 mt-6 text-sm">
          <Link
            href="https://github.com/ttqteo/vnstock-js"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
            {stars != null && (
              <span className="flex items-center gap-0.5 ml-1 text-xs font-mono">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {formatStars(stars)}
              </span>
            )}
          </Link>
          <span className="h-4 w-px bg-border" />
          <Link
            href="https://www.npmjs.com/package/vnstock-js"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>npm</span>
            {npmVersion && (
              <span className="ml-1 text-xs font-mono px-1.5 py-0.5 rounded bg-muted">
                v{npmVersion}
              </span>
            )}
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
