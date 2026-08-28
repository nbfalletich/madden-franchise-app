import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryLoading() {
  return (
    <div>
      <Skeleton className="mb-2 h-12 w-64" />
      <Skeleton className="mb-6 h-5 w-72" />
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-full" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
