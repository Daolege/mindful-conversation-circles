
import { Skeleton } from "@/components/ui/skeleton";

export const DetailPageSkeleton = () => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      
      {/* Course header skeleton */}
      <div className="mb-10">
        <Skeleton className="h-10 w-3/4 mb-8" />
        <div className="flex flex-wrap gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-6 w-24 rounded-full" />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content area skeleton */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course intro card */}
          <div className="rounded-lg border p-6 shadow-lg">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
          
          {/* Course outline card */}
          <div className="rounded-lg border p-6 shadow-lg">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-4 w-48 mb-6" />
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="pl-4 space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-6 w-8" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Course attachments */}
          <div className="rounded-lg border p-6 shadow-lg">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center border rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Enrollment card skeleton */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border p-6 shadow-lg">
            <div className="space-y-6">
              <div className="flex items-baseline">
                <Skeleton className="h-8 w-20 mr-3" />
                <Skeleton className="h-5 w-16 mr-3" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              
              <Skeleton className="h-12 w-full rounded-md" />
              
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
