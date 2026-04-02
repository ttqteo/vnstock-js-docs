export default function ExamplesLoading() {
  return (
    <div className="w-full mx-auto flex flex-col gap-1 sm:min-h-[91vh] min-h-[88vh] pt-2">
      <div className="mb-7 flex flex-col gap-3">
        <div className="h-9 w-48 bg-muted animate-pulse rounded" />
        <div className="h-5 w-96 max-w-full bg-muted animate-pulse rounded" />
      </div>

      <div className="grid lg:grid-cols-2 grid-cols-1 sm:gap-8 gap-4 mb-5">
        {/* Gold price skeleton */}
        <div className="grid gap-4 col-span-full">
          <div className="h-5 w-24 bg-muted animate-pulse rounded" />
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
        </div>

        {/* Index cards skeleton */}
        <div className="grid grid-cols-1 gap-4">
          <div className="h-5 w-20 bg-muted animate-pulse rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>

        {/* Realtime skeleton */}
        <div className="grid grid-cols-1 gap-4">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-40 bg-muted animate-pulse rounded-lg" />
        </div>

        {/* Table skeleton */}
        <div className="grid gap-4 col-span-full">
          <div className="h-5 w-40 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  );
}
