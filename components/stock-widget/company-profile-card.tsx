"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CompanyProfile {
  industry: string;
  industryEn: string;
  sector: string;
  sectorEn: string;
  issuedShares: number;
  history: string;
  profile: string;
}

interface Shareholder {
  name: string;
  percentage: number;
}

export function CompanyProfileCard({
  ticker,
  profile,
  shareholders,
}: {
  ticker: string;
  profile: CompanyProfile;
  shareholders: Shareholder[];
}) {
  if (!profile) return <div className="text-muted-foreground">Đang tải...</div>;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {ticker}
          <Badge variant="outline">{profile.industry}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="text-muted-foreground">Ngành</p>
          <p>{profile.sector} / {profile.industry}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Số cổ phiếu phát hành</p>
          <p className="font-medium">{profile.issuedShares?.toLocaleString()}</p>
        </div>
        {shareholders && shareholders.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-1">Cổ đông lớn</p>
            <div className="space-y-1">
              {shareholders.slice(0, 5).map((sh, i) => (
                <div key={i} className="flex justify-between">
                  <span className="truncate max-w-[200px]">{sh.name}</span>
                  <span className="font-medium">
                    {sh.percentage != null ? `${(sh.percentage * 100).toFixed(1)}%` : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
