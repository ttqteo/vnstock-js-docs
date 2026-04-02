export default function DocsLoading() {
  return (
    <div className="flex items-start gap-8 w-full">
      <div className="flex-[5.25] py-8 space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
        <div className="mt-6 h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
