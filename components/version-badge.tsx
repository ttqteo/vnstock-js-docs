import { NEW_BADGE_DAYS } from "@/lib/routes-config";

interface VersionBadgeProps {
  since?: string;
  releasedAt?: string;
}

function isWithinNewWindow(releasedAt?: string): boolean {
  if (!releasedAt) return false;
  const released = new Date(releasedAt + "T00:00:00Z").getTime();
  if (isNaN(released)) return false;
  const days = (Date.now() - released) / (24 * 60 * 60 * 1000);
  return days >= 0 && days <= NEW_BADGE_DAYS;
}

export function VersionBadge({ since, releasedAt }: VersionBadgeProps) {
  const isNew = isWithinNewWindow(releasedAt);
  if (!since && !isNew) return null;

  return (
    <span className="inline-flex items-center gap-1 ml-1.5 align-middle">
      {since && (
        <span
          title={`Có từ phiên bản ${since}`}
          className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-stone-700/60 text-stone-700 dark:text-stone-300 leading-none"
        >
          v{since}
        </span>
      )}
      {isNew && (
        <span
          title={`Tính năng mới (trong ${NEW_BADGE_DAYS} ngày)`}
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 leading-none"
        >
          Mới
        </span>
      )}
    </span>
  );
}
