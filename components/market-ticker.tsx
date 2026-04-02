"use client";

interface TickerItem {
  symbol: string;
  value: number;
  change: number;
  changePct: number;
}

export function MarketTicker({ data }: { data: TickerItem[] }) {
  return (
    <div className="border-b bg-muted/30 overflow-hidden">
      <div className="flex items-center justify-center gap-6 sm:gap-10 py-2.5 px-4 text-sm">
        {data.map((item) => {
          const isUp = item.change > 0;
          const isDown = item.change < 0;
          const color = isUp
            ? "text-green-600"
            : isDown
              ? "text-red-600"
              : "text-yellow-500";

          return (
            <div key={item.symbol} className="flex items-center gap-2 shrink-0">
              <span className="font-semibold text-xs sm:text-sm">
                {item.symbol}
              </span>
              <span className={`font-mono text-xs sm:text-sm ${color}`}>
                {item.value.toFixed(2)}
              </span>
              <span className={`font-mono text-xs ${color}`}>
                {isUp ? "+" : ""}
                {item.change.toFixed(2)} ({isUp ? "+" : ""}
                {item.changePct.toFixed(2)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
