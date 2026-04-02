"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TickerSearch } from "./ticker-search";

interface CompanyProfile {
  industry: string;
  industryEn: string;
  sector: string;
  sectorEn: string;
  issuedShares: number;
}

interface Shareholder {
  name: string;
  percentage: number;
}

interface CompanyData {
  ticker: string;
  profile: CompanyProfile;
  shareholders: Shareholder[];
}

export function CompanySearchCard({
  initialData,
}: {
  initialData: CompanyData;
}) {
  const [data, setData] = useState<CompanyData>(initialData);
  const [loading, setLoading] = useState(false);

  const handleSelect = (ticker: string) => {
    if (ticker === data.ticker) return;
    setLoading(true);
    fetch(`/api/stock/info?ticker=${ticker}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.profile) {
          setData({
            ticker,
            profile: res.profile,
            shareholders: res.shareholders || [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-3">
      <div className="max-w-xs">
        <TickerSearch onSelect={handleSelect} placeholder="Tìm công ty (VD: FPT, Vinhomes...)" />
      </div>

      {loading ? (
        <Card className="w-full">
          <CardContent className="py-8 text-center text-muted-foreground">
            Đang tải...
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {data.ticker}
              <Badge variant="outline">{data.profile.industry}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Ngành</p>
              <p>
                {data.profile.sector} / {data.profile.industry}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Số cổ phiếu phát hành</p>
              <p className="font-medium">
                {data.profile.issuedShares?.toLocaleString()}
              </p>
            </div>
            {data.shareholders && data.shareholders.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1">Cổ đông lớn</p>
                <div className="space-y-1">
                  {data.shareholders.slice(0, 5).map((sh, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate max-w-[200px]">{sh.name}</span>
                      <span className="font-medium">
                        {sh.percentage != null
                          ? `${(sh.percentage * 100).toFixed(1)}%`
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
