import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <Skeleton className="mb-4 h-5 w-32" />
      <Skeleton className="mb-3 h-6 w-24 rounded-full" />
      <Skeleton className="mb-2 h-10 w-full" />
      <Skeleton className="mb-6 h-10 w-3/4" />
      <Skeleton className="mb-6 aspect-[16/9] w-full rounded-xl" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
