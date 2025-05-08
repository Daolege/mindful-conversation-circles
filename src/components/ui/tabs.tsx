
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm text-muted-foreground p-2 w-full",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex items-center justify-center whitespace-nowrap rounded-xl px-5 py-3 text-sm font-medium",
      "ring-offset-background transition-all duration-500 ease-in-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:text-gray-900",
      "data-[state=active]:shadow-[0_3px_15px_rgba(0,0,0,0.15)]",
      "hover:bg-gray-100/50 relative overflow-hidden",
      "group flex-1",
      className
    )}
    {...props}
  >
    <span className="relative z-10 transition-all duration-300 transform 
                     group-hover:scale-110 
                     group-data-[state=active]:scale-105
                     group-data-[state=active]:font-semibold
                     group-data-[state=active]:text-gray-900
                     flex items-center justify-center w-full">
      {props.children}
    </span>
    <span 
      className="absolute inset-0 rounded-xl transition-all duration-500 ease-out
                 bg-gray-100
                 opacity-0 group-hover:opacity-100
                 data-[state=active]:opacity-100
                 transform scale-0 group-hover:scale-100 data-[state=active]:scale-100"
      data-state={props['data-state']}
    />
  </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-500 ease-in-out",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
