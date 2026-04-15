"use client";

interface TickerItem {
  symbol: string;
  value: number;
  change: number;
  changePct: number;
}

export function MarketTicker({ data }: { data: TickerItem[] }) {
  return (
    <div className="border-b bg-muted/30 overflow-x-auto scrollbar-none -mx-[5vw] sm:mx-0">
      <div className="flex items-center justify-start sm:justify-center gap-3 sm:gap-10 py-2.5 px-3 sm:px-4 text-sm min-w-max w-max mx-auto">
        {data.map((item) => {
          const isUp = item.change > 0;
          const isDown = item.change < 0;
          const color = isUp
            ? "text-green-600"
            : isDown
              ? "text-red-600"
              : "text-yellow-500";

          return (
            <div
              key={item.symbol}
              className="flex items-center gap-1.5 sm:gap-2 shrink-0"
            >
              <span className="font-semibold text-xs sm:text-sm">
                {item.symbol}
              </span>
              <span className={`font-mono text-xs sm:text-sm ${color}`}>
                {item.value.toFixed(2)}
              </span>
              {/* Compact on mobile: % only (color conveys direction). Desktop: full */}
              <span className={`font-mono text-xs ${color} sm:hidden`}>
                {isUp ? "+" : ""}
                {item.changePct.toFixed(2)}%
              </span>
              <span className={`font-mono text-xs ${color} hidden sm:inline`}>
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
