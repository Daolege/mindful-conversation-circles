
import { Skeleton } from '@/components/ui/skeleton';

export const OrderDetailSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full mt-8" />
        </div>
        <div>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full mt-4" />
        </div>
      </div>
    </div>
  );
};
