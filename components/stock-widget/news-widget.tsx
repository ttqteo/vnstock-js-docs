"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NewsArticle {
  item_id: string;
  source: string;
  title: string;
  summary: string;
  link: string;
  image_url: string;
  published_timestamp: string;
}

const SOURCE_COLORS: Record<string, string> = {
  vietstock: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  vnexpress: "bg-red-100 text-red-700 hover:bg-red-100",
  vneconomy: "bg-green-100 text-green-700 hover:bg-green-100",
  markettimes: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  "nguoi quan sat": "bg-purple-100 text-purple-700 hover:bg-purple-100",
  "người quan sát": "bg-purple-100 text-purple-700 hover:bg-purple-100",
  nguoiquansat: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  tinnhanhchungkhoan: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  "tin nhanh chung khoan": "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
};

function formatRelativeTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return `${date.getDate()}/${date.getMonth() + 1}`;
  } catch {
    return "";
  }
}

export function NewsWidget({ articles }: { articles: NewsArticle[] }) {
  if (!articles || articles.length === 0) {
    return <div className="text-muted-foreground">Không có tin tức</div>;
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-3 pr-4">
        {articles.map((article) => (
          <a
            key={article.item_id || article.link}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt=""
                      className="w-20 h-14 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-20 h-14 rounded flex-shrink-0 bg-muted flex items-center justify-center text-muted-foreground text-xs">
                      Tin tức
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        className={`text-[10px] px-1.5 py-0 ${
                          SOURCE_COLORS[article.source?.toLowerCase()] ||
                          "bg-gray-100 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {article.source}
                      </Badge>
                      {article.published_timestamp && (
                        <span>{formatRelativeTime(article.published_timestamp)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </ScrollArea>
  );
}
