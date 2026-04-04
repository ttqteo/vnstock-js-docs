"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  CircleDollarSign,
  Scissors,
  Users,
  PlusCircle,
} from "lucide-react";
import { EventCard } from "./event-card";
import { ACADEMY_TOOLTIPS } from "@/components/finance/academy-panel";

// Phân loại sự kiện
const EVENT_TYPES = {
  dividend: { label: "Cổ tức", icon: CircleDollarSign, color: "text-green-500" },
  split: { label: "Chia tách", icon: Scissors, color: "text-blue-500" },
  meeting: { label: "ĐHCĐ", icon: Users, color: "text-purple-500" },
  rights: { label: "Phát hành", icon: PlusCircle, color: "text-orange-500" },
  other: { label: "Khác", icon: Calendar, color: "text-muted-foreground" },
} as const;

type EventType = keyof typeof EVENT_TYPES;

// Heuristic phân loại dựa trên eventName
export function classifyEvent(eventName: string): EventType {
  const lower = eventName.toLowerCase();
  if (lower.includes("co tuc") || lower.includes("dividend")) return "dividend";
  if (
    lower.includes("chia") ||
    lower.includes("tach") ||
    lower.includes("split")
  )
    return "split";
  if (
    lower.includes("dhcd") ||
    lower.includes("dai hoi") ||
    lower.includes("meeting")
  )
    return "meeting";
  if (
    lower.includes("phat hanh") ||
    lower.includes("quyen mua") ||
    lower.includes("esop")
  )
    return "rights";
  return "other";
}

// Filter out garbage dates from API (e.g. year 54381, 215030)
export function isValidDate(dateStr?: string): boolean {
  if (!dateStr) return false;
  const year = parseInt(dateStr.slice(0, 4));
  return year >= 2000 && year <= 2100;
}

export interface CorporateEvent {
  ticker: string;
  title: string;
  exRightDate?: string;
  issuedAt?: string;
  recordDate?: string;
  eventTypeName?: string;
  [key: string]: unknown;
}

export function MarketCalendar({ events }: { events: CorporateEvent[] }) {
  const [filter, setFilter] = useState<EventType | "all">("all");

  const classifiedEvents = useMemo(
    () =>
      events.map((e) => ({ ...e, type: classifyEvent(e.title || e.eventTypeName || "") })),
    [events]
  );

  const filtered =
    filter === "all"
      ? classifiedEvents
      : classifiedEvents.filter((e) => e.type === filter);

  // Nhóm theo mã cổ phiếu
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const event of filtered) {
      const ticker = event.ticker || "Khác";
      if (!groups[ticker]) groups[ticker] = [];
      groups[ticker].push(event);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">
        Lịch Sự Kiện
      </h1>

      {/* Filter tabs with tooltips */}
      <TooltipProvider delayDuration={300}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tất cả ({classifiedEvents.length})
          </button>
          {(
            Object.entries(EVENT_TYPES) as [
              EventType,
              (typeof EVENT_TYPES)[EventType],
            ][]
          ).map(([key, { label, icon: Icon, color }]) => {
            const count = classifiedEvents.filter((e) => e.type === key).length;
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setFilter(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                      filter === key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon
                      className={`w-3 h-3 ${filter === key ? "" : color}`}
                    />
                    {label} ({count})
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[280px] text-xs">
                  {ACADEMY_TOOLTIPS[key]}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Events grouped by ticker */}
      {grouped.map(([ticker, events]) => (
        <div key={ticker}>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            {ticker} ({events.length})
          </h2>
          <div className="space-y-2">
            {events.map((event, i) => (
              <EventCard key={`${event.ticker}-${i}`} event={event} />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          Không có sự kiện nào.
        </p>
      )}
    </div>
  );
}

