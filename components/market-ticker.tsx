export interface TickerItem {
  label: string;
  /** Already formatted for display. */
  value: string;
  /** Formatted signed change, shown on wide screens only. */
  change?: string;
  /** Percent number; null or absent prints no percent and keeps the value neutral. */
  changePct?: number | null;
  unit?: string;
}

// Full-bleed strip under the navbar: breaks out of the page container to the viewport edges.
export function MarketTicker({ items }: { items: TickerItem[] }) {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 border-b bg-muted/30 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-5 sm:gap-10 py-2.5 px-4 text-sm min-w-max w-max mx-auto">
        {items.map((item) => {
          const pct = item.changePct ?? null;
          const color =
            pct === null ? "text-foreground/80" : pct > 0 ? "text-green-600" : pct < 0 ? "text-red-600" : "text-yellow-500";
          const sign = pct !== null && pct > 0 ? "+" : "";

          return (
            <div key={item.label} className="flex items-baseline gap-1.5 sm:gap-2 shrink-0">
              <span className="font-semibold text-xs sm:text-sm">{item.label}</span>
              <span className={`font-mono text-xs sm:text-sm ${color}`}>{item.value}</span>
              {item.unit && <span className="text-[11px] text-muted-foreground">{item.unit}</span>}
              {pct !== null && (
                <span className={`font-mono text-xs ${color}`}>
                  {item.change && <span className="hidden sm:inline">{item.change} </span>}
                  ({sign}
                  {pct.toFixed(2)}%)
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
