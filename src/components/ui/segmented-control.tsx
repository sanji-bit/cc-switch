import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SegmentedControlProps {
  children: React.ReactNode;
  className?: string;
}

interface SegmentedControlItemProps
  extends Omit<React.ComponentProps<typeof Button>, "variant" | "size"> {
  active?: boolean;
}

export function SegmentedControl({
  children,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "inline-flex w-fit gap-1 rounded-[10px] bg-muted p-0.5 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SegmentedControlItem({
  active = false,
  className,
  ...props
}: SegmentedControlItemProps) {
  return (
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        "cursor-pointer rounded-[8px] border-0 bg-transparent shadow-none transition-all",
        active
          ? "bg-card text-foreground shadow-sm hover:bg-card hover:text-foreground/80"
          : "text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5 dark:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
