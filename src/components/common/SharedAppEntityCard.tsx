import React from "react";
import { ArrowUpRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SharedAppEntityCardProps {
  title: string;
  description: string;
  descriptionTitle?: string;
  onOpenExternal?: () => void;
  externalLabel?: string;
  footerLeft: React.ReactNode;
  footerActions?: React.ReactNode;
  className?: string;
}

function renderFooterActionsWithTooltips(actions: React.ReactNode): React.ReactNode {
  return React.Children.map(actions, (child, index) => {
    if (!React.isValidElement<any>(child)) {
      return child;
    }

    if (child.type === React.Fragment) {
      return (
        <React.Fragment key={child.key ?? `fragment-${index}`}>
          {renderFooterActionsWithTooltips(child.props.children)}
        </React.Fragment>
      );
    }

    const tooltipLabel =
      typeof child.props["aria-label"] === "string"
        ? child.props["aria-label"]
        : typeof child.props.title === "string"
          ? child.props.title
          : undefined;

    if (!tooltipLabel) {
      return child;
    }

    const trigger = React.cloneElement(child, {
      title: undefined,
      "aria-label": child.props["aria-label"] ?? tooltipLabel,
    });

    return (
      <Tooltip key={child.key ?? `action-${index}`}>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent side="top">
          <p>{tooltipLabel}</p>
        </TooltipContent>
      </Tooltip>
    );
  });
}

export const SharedAppEntityCard: React.FC<SharedAppEntityCardProps> = ({
  title,
  description,
  descriptionTitle,
  onOpenExternal,
  externalLabel,
  footerLeft,
  footerActions,
  className,
}) => {
  return (
    <div
      className={`group flex h-full w-full flex-col overflow-hidden rounded-[16px] border-[0.5px] border-border/80 bg-card text-card-foreground shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)] ${className ?? ""}`}
    >
      <div className="flex items-center gap-4 px-4 py-4">
        <div className="flex min-w-0 flex-1 items-center">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-[16px] font-semibold leading-5 text-foreground">
                  {title}
                </h3>
                {onOpenExternal && (
                  <button
                    type="button"
                    onClick={onOpenExternal}
                    className="flex-shrink-0 text-muted-foreground/60 transition-colors hover:text-foreground"
                    title={externalLabel}
                    aria-label={externalLabel}
                  >
                    <ArrowUpRight size={14} />
                  </button>
                )}
              </div>

              <p
                className="mt-2 min-h-5 line-clamp-1 text-[13px] leading-5 text-muted-foreground"
                title={descriptionTitle ?? description}
              >
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto px-4 pb-3">
        <div className="flex items-center justify-between gap-3 border-t-[0.5px] border-border/50 pt-3">
          {footerLeft}

          {footerActions && (
            <TooltipProvider>
              <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                {renderFooterActionsWithTooltips(footerActions)}
              </div>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
};
