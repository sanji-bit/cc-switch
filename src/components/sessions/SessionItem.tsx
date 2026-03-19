import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ProviderIcon } from "@/components/ProviderIcon";
import type { SessionMeta } from "@/types";
import {
  formatRelativeTime,
  formatSessionTitle,
  getProviderIconName,
  getProviderLabel,
  getSessionKey,
} from "./utils";

interface SessionItemProps {
  session: SessionMeta;
  isSelected: boolean;
  onSelect: (key: string) => void;
}

export function SessionItem({
  session,
  isSelected,
  onSelect,
}: SessionItemProps) {
  const { t } = useTranslation();
  const title = formatSessionTitle(session);
  const lastActive = session.lastActiveAt || session.createdAt || undefined;
  const sessionKey = getSessionKey(session);

  return (
    <button
      type="button"
      onClick={() => onSelect(sessionKey)}
      className={cn(
        "w-full rounded-lg px-3 py-2.5 text-left transition-colors",
        isSelected ? "bg-primary/10" : "hover:bg-muted/60",
      )}
    >
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="shrink-0">
              <ProviderIcon
                icon={getProviderIconName(session.providerId)}
                name={session.providerId}
                size={18}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {getProviderLabel(session.providerId, t)}
          </TooltipContent>
        </Tooltip>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>
        <span className="shrink-0 text-[11px] text-muted-foreground/70">
          {lastActive ? formatRelativeTime(lastActive, t) : t("common.unknown")}
        </span>
      </div>
    </button>
  );
}
