
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-10 border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        success:
          "border-transparent bg-success text-success-foreground hover:bg-success/90",
        warning:
          "border-transparent bg-amber-500 text-white hover:bg-amber-600",
        outline: "text-foreground",
        course: 
          "border-transparent bg-gray-800 text-white px-3 py-1.5 hover:bg-gray-700 transform transition-all duration-200 hover:scale-105 cursor-pointer shadow-sm hover:shadow-md rounded-10",
        courseTag:
          "border border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100 px-3 py-1.5 transform transition-all duration-200 hover:scale-105 cursor-pointer shadow-sm hover:shadow-md rounded-10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
