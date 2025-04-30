
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingStateSkeleton = () => {
  const skeletonCards = Array(6).fill(0);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-4 skeleton-wave" />
        <Skeleton className="h-5 w-96 skeleton-wave" />
      </div>
      
      {/* Filter bar skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full skeleton-wave" />
          ))}
        </div>
        <Skeleton className="h-9 w-36 skeleton-wave" />
      </div>
      
      {/* Course grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletonCards.map((_, index) => (
          <div 
            key={index} 
            className="rounded-xl border overflow-hidden shadow-lg animate-in fade-in duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Skeleton className="h-48 w-full skeleton-wave" />
            <div className="p-5 space-y-4">
              <Skeleton className="h-6 w-3/4 skeleton-wave" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full skeleton-wave" />
                <Skeleton className="h-5 w-16 rounded-full skeleton-wave" />
              </div>
              <Skeleton className="h-4 w-full skeleton-wave" />
              <Skeleton className="h-4 w-5/6 skeleton-wave" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-6 w-24 skeleton-wave" />
                <Skeleton className="h-8 w-20 rounded-md skeleton-wave" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
