
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingStateSkeleton = () => {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Filter bar skeleton */}
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-8 w-40" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-56 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
      
      {/* Tabs skeleton */}
      <div className="mb-8">
        <div className="flex gap-2 border-b pb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-20 rounded-md" />
          ))}
        </div>
      </div>
      
      {/* Course grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(null).map((_, index) => (
          <div 
            key={index} 
            className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-[360px] animate-pulse"
            style={{
              animationDelay: `${index * 100}ms`,
              opacity: 0,
              animation: `pulse 2s infinite, fade-in 0.5s forwards ${index * 100}ms`
            }}
          >
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 skeleton-wave"></div>
            </div>
            <div className="p-5 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full relative overflow-hidden">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-2/3 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="h-6 bg-gray-200 rounded w-1/4 relative overflow-hidden">
                  <div className="absolute inset-0 skeleton-wave"></div>
                </div>
                <div className="h-9 bg-gray-200 rounded w-1/3 relative overflow-hidden">
                  <div className="absolute inset-0 skeleton-wave"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
