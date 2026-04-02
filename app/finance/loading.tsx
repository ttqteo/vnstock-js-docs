export default function FinanceLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />

      {/* Index cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded" />
        ))}
      </div>

      {/* Main + sidebar skeleton */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="h-96 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          <div className="h-48 bg-muted animate-pulse rounded" />
          <div className="h-48 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
