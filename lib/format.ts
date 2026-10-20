/**
 * vnstock-js 2.x returns every amount in dong and index levels in points.
 * These helpers are the only place the docs app turns them into display units.
 */

const two = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Stock price in dong as the price board shows it: 24200 -> "24.20". */
export function fmtPrice(dong: number | null | undefined): string {
  return dong == null || !Number.isFinite(dong) ? "–" : two(dong / 1000);
}

/** Signed stock price change in dong: 300 -> "+0.30". */
export function fmtChange(dong: number | null | undefined): string {
  if (dong == null || !Number.isFinite(dong)) return "–";
  return (dong > 0 ? "+" : "") + two(dong / 1000);
}

/** Index level in points: 1689.84 -> "1,689.84". */
export function fmtPoints(n: number | null | undefined): string {
  return n == null || !Number.isFinite(n) ? "–" : two(n);
}

/** Percent number: 0.95 -> "+0.95%". */
export function fmtPct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "–";
  return (n > 0 ? "+" : "") + n.toFixed(2) + "%";
}

/** Money in dong: "8,720.4 tỷ", "235.5 triệu", "12,300 đ". */
export function fmtMoney(dong: number | null | undefined): string {
  if (dong == null || !Number.isFinite(dong)) return "–";
  const a = Math.abs(dong);
  if (a >= 1e9) return (dong / 1e9).toLocaleString("en-US", { maximumFractionDigits: a >= 1e11 ? 1 : 2 }) + " tỷ";
  if (a >= 1e6) return (dong / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 }) + " triệu";
  return Math.round(dong).toLocaleString("en-US") + " đ";
}

/** Whole dong with separators: 138000000 -> "138,000,000". */
export function fmtDong(dong: number | null | undefined): string {
  return dong == null || !Number.isFinite(dong) ? "–" : Math.round(dong).toLocaleString("en-US");
}

/** Share volume: 3120000 -> "3.12M". */
export function fmtVolume(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "–";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(Math.round(n));
}

/** Signed index change in points: +5.20 / -1.20 */
export function fmtPointsChange(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "–";
  return (n > 0 ? "+" : "") + two(n);
}
