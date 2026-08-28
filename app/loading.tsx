import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="space-y-10">
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="aspect-[16/10] w-full rounded-xl sm:aspect-[16/9]" />
      <div>
        <Skeleton className="mb-3 h-7 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="mb-3 h-7 w-56" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}
