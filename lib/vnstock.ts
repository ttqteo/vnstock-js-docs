import { createClient } from "vnstock-js";

/** Server-side client for pages and API routes. Every amount it returns is dong; indices are points. */
export const vn = createClient();

export interface QuarterlyIncome {
  year: number;
  quarter: number;
  /** Dong. */
  revenue: number;
  netProfit: number;
}

/** Quarterly revenue and net profit, oldest first. Banks and brokers use other line items, so fields are picked by English title. */
export async function quarterlyIncome(symbol: string): Promise<QuarterlyIncome[]> {
  const st = await vn.stock(symbol).financials("income", { period: "quarter" });
  const pick = (re: RegExp) => st.fields.find((f) => re.test(f.titleEn))?.field;
  const revenue = pick(/^Net sales$/i) ?? pick(/Total operating income/i);
  const profit = pick(/Attributable to parent/i) ?? pick(/Net profit/i);
  const out: QuarterlyIncome[] = [];
  for (const r of st.rows) {
    const m = /^(\d{4})-Q(\d)$/.exec(r.period);
    if (!m) continue;
    out.push({
      year: Number(m[1]),
      quarter: Number(m[2]),
      revenue: revenue ? r.values[revenue] ?? 0 : 0,
      netProfit: profit ? r.values[profit] ?? 0 : 0,
    });
  }
  return out;
}
