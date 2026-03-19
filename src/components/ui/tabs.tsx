import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-1 rounded-xl bg-muted/70 p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: "default" | "underline" | "line";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    data-variant={variant}
    className={cn(
      "inline-flex min-w-[120px] items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border/80 data-[state=inactive]:opacity-70 data-[state=inactive]:hover:opacity-100 data-[state=inactive]:hover:bg-background/60 data-[variant=underline]:min-w-0 data-[variant=underline]:rounded-none data-[variant=underline]:bg-transparent data-[variant=underline]:px-0 data-[variant=underline]:py-0 data-[variant=underline]:pb-3 data-[variant=underline]:shadow-none data-[variant=underline]:ring-0 data-[variant=underline]:text-muted-foreground data-[variant=underline]:data-[state=active]:border-b-2 data-[variant=underline]:data-[state=active]:border-foreground/80 data-[variant=underline]:data-[state=active]:bg-transparent data-[variant=underline]:data-[state=active]:text-foreground data-[variant=underline]:data-[state=active]:shadow-none data-[variant=underline]:data-[state=active]:ring-0 data-[variant=underline]:data-[state=inactive]:hover:bg-transparent data-[variant=underline]:data-[state=inactive]:hover:text-foreground data-[variant=line]:relative data-[variant=line]:min-w-0 data-[variant=line]:rounded-none data-[variant=line]:bg-transparent data-[variant=line]:px-0 data-[variant=line]:py-0 data-[variant=line]:pb-3 data-[variant=line]:shadow-none data-[variant=line]:ring-0 data-[variant=line]:text-muted-foreground data-[variant=line]:data-[state=active]:bg-transparent data-[variant=line]:data-[state=active]:text-foreground data-[variant=line]:data-[state=active]:shadow-none data-[variant=line]:data-[state=active]:ring-0 data-[variant=line]:data-[state=inactive]:hover:bg-transparent data-[variant=line]:data-[state=inactive]:hover:text-foreground data-[variant=line]:after:absolute data-[variant=line]:after:inset-x-0 data-[variant=line]:after:bottom-0 data-[variant=line]:after:h-[2px] data-[variant=line]:after:rounded-full data-[variant=line]:after:bg-transparent data-[variant=line]:data-[state=active]:after:bg-foreground/80",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
