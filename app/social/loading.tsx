import { Skeleton } from "@/components/ui/skeleton";

export default function SocialLoading() {
  return (
    <div>
      <Skeleton className="mb-2 h-10 w-36" />
      <Skeleton className="mb-6 h-5 w-80" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
