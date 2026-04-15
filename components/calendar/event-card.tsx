import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SymbolLink } from "@/components/stock-widget/stock-chart-dialog";

interface EventCardProps {
  event: {
    ticker: string;
    title: string;
    eventTypeName?: string;
    ratio?: number | null;
    value?: number | null;
    type: string;
    [key: string]: unknown;
  };
}

const TYPE_COLORS: Record<string, string> = {
  dividend: "bg-green-500/10 text-green-500 border-green-500/20",
  split: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  meeting: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  rights: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  other: "bg-muted text-muted-foreground",
};

const TYPE_LABELS: Record<string, string> = {
  dividend: "Cổ tức",
  split: "Chia tách",
  meeting: "ĐHCĐ",
  rights: "Phát hành",
  other: "Khác",
};

export function EventCard({ event }: EventCardProps) {
  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4 flex items-center gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <SymbolLink symbol={event.ticker} className="text-sm font-bold" />
            <Badge
              variant="outline"
              className={`text-[0.6rem] px-1.5 py-0 ${TYPE_COLORS[event.type]}`}
            >
              {TYPE_LABELS[event.type]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {event.title}
          </p>
        </div>

        {/* Value/Ratio info */}
        {event.value != null && event.value > 0 && (
          <div className="text-right shrink-0">
            <p className="text-[0.6rem] text-muted-foreground uppercase">
              Giá trị
            </p>
            <p className="text-xs font-mono">
              {event.value.toLocaleString()}đ
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
