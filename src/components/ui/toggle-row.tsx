import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export interface ToggleRowProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  iconWrapperClassName?: string;
}

export function ToggleRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
  contentClassName,
  iconWrapperClassName,
}: ToggleRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-[8px] bg-muted/50 p-4 transition-colors hover:bg-muted/70",
        className,
      )}
    >
      <div className={cn("flex items-center gap-3", contentClassName)}>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-[8px] bg-muted",
            iconWrapperClassName,
          )}
        >
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">{title}</p>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <Switch
        size="sm"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={title}
      />
    </div>
  );
}
