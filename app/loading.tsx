export default function HomeLoading() {
  return (
    <div className="flex flex-col">
      {/* Ticker skeleton */}
      <div className="w-full border-b bg-muted/30 py-2.5 px-4">
        <div className="flex items-center justify-center gap-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-40 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="flex flex-col items-center pt-28 pb-20 gap-4">
        <div className="w-12 h-12 bg-muted animate-pulse rounded-full" />
        <div className="h-12 w-64 bg-muted animate-pulse rounded" />
        <div className="h-5 w-96 max-w-full bg-muted animate-pulse rounded" />
        <div className="h-10 w-56 bg-muted animate-pulse rounded-lg mt-4" />
        <div className="flex gap-4 mt-4">
          <div className="h-11 w-28 bg-muted animate-pulse rounded-md" />
          <div className="h-11 w-28 bg-muted animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
}
