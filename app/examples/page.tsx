import { GoldPriceDataTable } from "@/components/stock-widget/gold-price-datatable";
import { TopGainersLosersTable } from "@/components/stock-widget/top-gainers-losers-table";
import { ScreeningTable } from "@/components/stock-widget/screening-table";
import { DrawdownChart } from "@/components/stock-widget/drawdown-chart";
import { StockExplorer } from "@/components/stock-widget/stock-explorer";
import { ExampleBlock } from "@/components/example-block";
import { Metadata } from "next";
import { sma, rsi } from "vnstock-js/indicators";
import { vn, quarterlyIncome } from "@/lib/vnstock";

export const metadata: Metadata = {
  title: "Ví Dụ",
};

/**
 * Render theo từng request thay vì dựng sẵn lúc build.
 *
 * Trang này lấy dữ liệu thật từ VCI. Khi dựng sẵn, nguồn chậm hoặc trả 429 là
 * cả build vỡ, dù nội dung site không liên quan gì tới VCI. Đổi sang render
 * theo request thì build không còn phụ thuộc nguồn ngoài.
 */
export const dynamic = "force-dynamic";

const CODE_SNIPPETS = {
  goldPrice: `import { vn } from "vnstock-js";

// Giá vàng trong nước, đồng/lượng (BTMC, dự phòng GiaVang.net)
const { source, items } = await vn.gold();`,

  topGainersLosers: `import { vn } from "vnstock-js";

// Top tăng/giảm, giá tính bằng đồng
const { gainers, losers } = await vn.topMovers({ limit: 20 });`,

  screening: `import { vn } from "vnstock-js";

// P/E dưới 15, ROE trên 10% (tỷ số là phân số)
const rows = await vn.screen({
  exchange: "HOSE",
  where: { pe: { lt: 15 }, roe: { gt: 0.1 } },
  sort: "-roe",
  limit: 15,
});`,

  drawdown: `import { vn } from "vnstock-js";

// Chỉ số tính bằng điểm
const bars = await vn.index("VNINDEX").history({ from: "2023-01-01" });

// Drawdown từ đỉnh
let peak = 0;
const drawdown = bars.map((b) => {
  peak = Math.max(peak, b.close);
  return { time: b.time, close: b.close, drawdown: ((peak - b.close) / peak) * 100 };
});`,

  stockExplorer: `import { vn } from "vnstock-js";
import { sma, rsi } from "vnstock-js/indicators";

const fpt = vn.stock("FPT");

// Nến ngày (giá bằng đồng) + chỉ báo
const bars = await fpt.history({ from: "2024-01-01" });
const sma20 = sma(bars, { period: 20 });
const rsi14 = rsi(bars);

// Thông tin công ty
const profile = await fpt.company();
const shareholders = await fpt.shareholders();

// Kết quả kinh doanh theo quý: { unit: "VND", fields, rows }
const income = await fpt.financials("income", { period: "quarter" });`,
};

/**
 * Trang này gọi API thật lúc prerender. Nguồn chậm hoặc chặn là cả build vỡ,
 * dù nội dung không liên quan. Mọi lời gọi phải tự chịu lỗi và trả về rỗng,
 * giống cách trang chủ đã làm với badge npm và số sao GitHub.
 */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

const explorerTicker = "FPT";

export default async function ExamplesPage() {
  // Chạy song song. Gọi tuần tự thì tổng thời gian cộng dồn và vượt hạn 60 giây
  // sinh trang tĩnh của Next, làm hỏng build dù từng lời gọi đều bình thường.
  const explorer = vn.stock(explorerTicker);
  const [gold, movers, screened, indexData, explorerHistory, explorerProfile, explorerShareholders, explorerFinancials] =
    await Promise.all([
      safe(() => vn.gold(), null),
      safe(() => vn.topMovers({ limit: 20 }), null),
      safe(() => vn.screen({ exchange: "HOSE", where: { pe: { lt: 15 }, roe: { gt: 0.1 } }, sort: "-roe", limit: 15 }), []),
      safe(() => vn.index("VNINDEX").history({ from: "2023-01-01" }), []),
      safe(() => explorer.history({ from: "2024-01-01" }), []),
      safe(() => explorer.company(), null),
      safe(() => explorer.shareholders(), []),
      safe(() => quarterlyIncome(explorerTicker), []),
    ]);
  const goldPrice = gold ? gold.items : [];
  const gainers = movers ? movers.gainers : [];
  const losers = movers ? movers.losers : [];

  // Index levels are points.
  let peak = 0;
  const drawdownData = indexData.map((d) => {
    peak = Math.max(peak, d.close);
    return { date: d.time, close: d.close, drawdown: ((peak - d.close) / peak) * 100 };
  });
  const explorerSma = sma(explorerHistory, { period: 20 });
  const explorerRsi = rsi(explorerHistory);
  const explorerIndicators = explorerHistory.map((h, i) => ({
    date: h.time,
    close: h.close,
    sma20: explorerSma[i]?.sma ?? null,
    rsi14: explorerRsi[i]?.rsi ?? null,
  }));

  return (
    <div className="w-full mx-auto flex flex-col gap-1 sm:min-h-[91vh] min-h-[88vh] pt-2">
      <div className="mb-7 flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold">Ví dụ mẫu</h1>
        <p className="text-muted-foreground">
          Các widget mẫu dùng vnstock-js. Bấm tab{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">Code</code>{" "}
          để xem code và copy.
        </p>
      </div>

      <div className="flex flex-col sm:gap-8 gap-6 mb-5">
        <ExampleBlock title="Top Tăng / Giảm" code={CODE_SNIPPETS.topGainersLosers}>
          <TopGainersLosersTable gainers={gainers} losers={losers} />
        </ExampleBlock>

        <ExampleBlock
          title="Sàng Lọc Cổ Phiếu (HOSE, PE < 15, ROE > 10%)"
          code={CODE_SNIPPETS.screening}
        >
          <ScreeningTable data={screened} />
        </ExampleBlock>

        {drawdownData.length > 0 && (
          <ExampleBlock
            title="VN-Index Drawdown"
            code={CODE_SNIPPETS.drawdown}
          >
            <DrawdownChart data={drawdownData} />
          </ExampleBlock>
        )}

        <ExampleBlock
          title="Tra Cứu Cổ Phiếu"
          code={CODE_SNIPPETS.stockExplorer}
        >
          <StockExplorer
            initialData={{
              ticker: explorerTicker,
              profile: explorerProfile,
              shareholders: explorerShareholders,
              ratios: null,
              chartData: explorerHistory,
              smaData: explorerSma,
              indicators: explorerIndicators,
              financialData: explorerFinancials,
            }}
          />
        </ExampleBlock>

        <ExampleBlock title="Giá Vàng" code={CODE_SNIPPETS.goldPrice}>
          <GoldPriceDataTable goldPrice={goldPrice} />
        </ExampleBlock>
      </div>
    </div>
  );
}
