
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted relative overflow-hidden", className)}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full skeleton-wave-shimmer"></div>
    </div>
  )
}

export { Skeleton }
