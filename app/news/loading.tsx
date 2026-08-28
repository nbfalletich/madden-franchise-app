import { Skeleton } from "@/components/ui/skeleton";

export default function NewsLoading() {
  return (
    <div>
      <Skeleton className="mb-2 h-10 w-40" />
      <Skeleton className="mb-6 h-5 w-72" />
      <div className="mb-5 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
