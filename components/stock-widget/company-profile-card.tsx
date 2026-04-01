"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CompanyProfileCard({
  data,
}: {
  data: any;
}) {
  if (!data) return <div>Loading profile...</div>;

  const { CompanyListingInfo } = data;

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>{CompanyListingInfo.companyProfile}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        <p>
          <strong>Industry:</strong> {CompanyListingInfo.icbName3}
        </p>
        <p>
          <strong>CEO:</strong> {CompanyListingInfo.companyProfile}
        </p>
        <p>
          <strong>Phone:</strong> {CompanyListingInfo.companyProfile}
        </p>
        <p>
          <strong>Address:</strong> {CompanyListingInfo.companyProfile}
        </p>
      </CardContent>
    </Card>
  );
}
