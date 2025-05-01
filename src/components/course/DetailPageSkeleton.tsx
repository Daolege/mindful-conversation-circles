
import { Skeleton } from "@/components/ui/skeleton";

export const DetailPageSkeleton = () => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex justify-between items-center animate-in fade-in slide-in-from-top-3 duration-700">
        <div className="flex gap-2 items-center">
          <Skeleton className="h-4 w-16 skeleton-wave" />
          <Skeleton className="h-3 w-3 rounded-full skeleton-wave" />
          <Skeleton className="h-4 w-20 skeleton-wave" />
          <Skeleton className="h-3 w-3 rounded-full skeleton-wave" />
          <Skeleton className="h-4 w-32 skeleton-wave" />
        </div>
      </div>
      
      {/* Course header skeleton */}
      <div className="mb-10 animate-in fade-in slide-in-from-left-5 duration-700 delay-100">
        <Skeleton className="h-10 w-3/4 mb-8 skeleton-wave" />
        <div className="flex flex-wrap gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton 
              key={i} 
              className="h-6 w-24 rounded-full skeleton-wave" 
              style={{animationDelay: `${i * 100}ms`}}
            />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content area skeleton */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course intro card */}
          <div className="rounded-lg border p-6 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-700 delay-200">
            <Skeleton className="h-6 w-40 mb-4 skeleton-wave" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full skeleton-wave" />
              <Skeleton className="h-4 w-5/6 skeleton-wave" />
              <Skeleton className="h-4 w-4/6 skeleton-wave" />
            </div>
          </div>
          
          {/* Course outline card */}
          <div className="rounded-lg border p-6 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-700 delay-300">
            <Skeleton className="h-6 w-40 mb-4 skeleton-wave" />
            <Skeleton className="h-4 w-48 mb-6 skeleton-wave" />
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3 animate-in fade-in duration-500" style={{animationDelay: `${300 + i * 150}ms`}}>
                  <div className="flex justify-between items-center border-b pb-2">
                    <Skeleton className="h-5 w-56 skeleton-wave" />
                    <Skeleton className="h-4 w-16 skeleton-wave" />
                  </div>
                  <div className="pl-4 space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex justify-between items-center animate-in fade-in duration-300" style={{animationDelay: `${400 + (i + j) * 100}ms`}}>
                        <Skeleton className="h-4 w-48 skeleton-wave" />
                        <Skeleton className="h-6 w-16 rounded-md skeleton-wave" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Course attachments */}
          <div className="rounded-lg border p-6 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-700 delay-400">
            <Skeleton className="h-6 w-40 mb-4 skeleton-wave" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center border rounded-lg p-4 animate-in fade-in duration-500" style={{animationDelay: `${500 + i * 150}ms`}}>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 skeleton-wave" />
                    <Skeleton className="h-4 w-32 skeleton-wave" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md skeleton-wave" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Learning information cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-500">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border p-6 shadow-sm" style={{animationDelay: `${600 + i * 100}ms`}}>
                <Skeleton className="h-6 w-24 mb-4 skeleton-wave" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-center gap-2 animate-in fade-in duration-300" style={{animationDelay: `${700 + (i + j) * 100}ms`}}>
                      <Skeleton className="h-4 w-4 rounded-full skeleton-wave" />
                      <Skeleton className="h-4 w-full skeleton-wave" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Enrollment card skeleton */}
        <div className="lg:col-span-1 animate-in fade-in slide-in-from-right-5 duration-700 delay-200">
          <div className="sticky top-4 rounded-lg border p-6 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-baseline">
                <Skeleton className="h-8 w-20 mr-3 skeleton-wave" />
                <Skeleton className="h-5 w-16 mr-3 skeleton-wave" />
                <Skeleton className="h-6 w-12 rounded-full skeleton-wave" />
              </div>
              
              <Skeleton className="h-12 w-full rounded-md skeleton-wave" />
              
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center animate-in fade-in duration-300" style={{animationDelay: `${300 + i * 100}ms`}}>
                    <Skeleton className="h-4 w-4 mr-2 skeleton-wave" />
                    <Skeleton className="h-4 w-20 skeleton-wave" />
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
