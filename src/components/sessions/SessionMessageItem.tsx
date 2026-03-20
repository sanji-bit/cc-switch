import { Copy, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProviderIcon } from "@/components/ProviderIcon";
import { cn } from "@/lib/utils";
import type { SessionMessage } from "@/types";
import { formatTimestamp, getRoleLabel, getProviderIconName } from "./utils";

interface SessionMessageItemProps {
  message: SessionMessage;
  providerId: string;
  index: number;
  isActive: boolean;
  setRef: (el: HTMLDivElement | null) => void;
  onCopy: (content: string) => void;
}

export function SessionMessageItem({
  message,
  providerId,
  isActive,
  setRef,
  onCopy,
}: SessionMessageItemProps) {
  const { t } = useTranslation();
  const role = message.role.toLowerCase();

  const avatar =
    role === "user" ? (
      <svg
        width="16"
        height="20"
        viewBox="0 0 16 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-4"
        aria-hidden="true"
      >
        <g clipPath="url(#session-user-avatar-clip)">
          <circle cx="8" cy="4" r="4" fill="currentColor" />
          <path
            d="M16 15.5C16 17.9853 16 20 8 20C0 20 0 17.9853 0 15.5C0 13.0147 3.58172 11 8 11C12.4183 11 16 13.0147 16 15.5Z"
            fill="currentColor"
          />
        </g>
        <defs>
          <clipPath id="session-user-avatar-clip">
            <rect width="16" height="20" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ) : role === "assistant" ? (
      <ProviderIcon
        icon={getProviderIconName(providerId)}
        name={providerId}
        size={20}
      />
    ) : (
      <Wrench className="size-4" />
    );

  return (
    <div
      ref={setRef}
      className={cn("group flex min-w-0 items-start gap-4", isActive && "rounded-xl")}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/70 text-primary">
        {avatar}
      </div>

      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {getRoleLabel(message.role, t)}
          </span>
          {message.ts && (
            <span className="opacity-0 transition-opacity group-hover:opacity-100">
              {formatTimestamp(message.ts)}
            </span>
          )}
        </div>

        <div
          className={cn(
            "relative inline-block max-w-[min(100%,780px)] min-w-0 rounded-2xl px-4 py-3 transition-all",
            role === "user"
              ? "bg-primary/15"
              : role === "assistant"
                ? "bg-muted/60"
                : "bg-muted/40",
            isActive && "ring-2 ring-primary ring-offset-2",
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => onCopy(message.content)}
              >
                <Copy className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t("sessionManager.copyMessage", {
                defaultValue: "复制内容",
              })}
            </TooltipContent>
          </Tooltip>

          <div className="min-w-0 whitespace-pre-wrap text-sm leading-relaxed [overflow-wrap:anywhere]">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
}
