import { Skeleton } from "@/components/ui/skeleton";

export default function CoachesLoading() {
  return (
    <div>
      <Skeleton className="mb-4 h-5 w-32" />
      <Skeleton className="mb-6 h-10 w-48" />
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
