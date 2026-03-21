import type { AppId } from "@/lib/api";
import type { VisibleApps } from "@/types";
import { ProviderIcon } from "@/components/ProviderIcon";
import { cn } from "@/lib/utils";

interface AppSwitcherProps {
  activeApp: AppId;
  onSwitch: (app: AppId) => void;
  visibleApps?: VisibleApps;
  compact?: boolean;
  orientation?: "horizontal" | "vertical";
  isHighlighted?: boolean;
}

const ALL_APPS: AppId[] = ["claude", "codex", "gemini", "opencode", "openclaw"];
const STORAGE_KEY = "cc-switch-last-app";

export function AppSwitcher({
  activeApp,
  onSwitch,
  visibleApps,
  compact,
  orientation = "horizontal",
  isHighlighted = true,
}: AppSwitcherProps) {
  const handleSwitch = (app: AppId) => {
    localStorage.setItem(STORAGE_KEY, app);
    onSwitch(app);
  };
  const iconSize = 20;
  const appIconName: Record<AppId, string> = {
    claude: "claude",
    codex: "openai",
    gemini: "gemini",
    opencode: "opencode",
    openclaw: "openclaw",
  };
  const appDisplayName: Record<AppId, string> = {
    claude: "Claude Code",
    codex: "Codex",
    gemini: "Gemini CLI",
    opencode: "OpenCode",
    openclaw: "OpenClaw",
  };

  // Filter apps based on visibility settings (default all visible)
  const appsToShow = ALL_APPS.filter((app) => {
    if (!visibleApps) return true;
    return visibleApps[app];
  });

  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        isVertical
          ? "flex flex-col gap-1"
          : "inline-flex gap-1 rounded-xl border border-border/70 bg-muted/70 p-1",
      )}
    >
      {appsToShow.map((app) => {
        const appIsHighlighted = isHighlighted && activeApp === app;
        return (
          <button
            key={app}
            type="button"
            onClick={() => handleSwitch(app)}
            className={cn(
              "group inline-flex items-center rounded-lg text-sm font-medium transition-all duration-200",
              isVertical
                ? "h-10 w-full justify-start px-3"
                : "h-8 px-3 justify-center",
              appIsHighlighted
                ? "bg-background text-foreground ring-1 ring-border/80"
                : "text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5",
            )}
          >
            <ProviderIcon
              icon={appIconName[app]}
              name={appDisplayName[app]}
              size={iconSize}
            />
            <span
              className={cn(
                "transition-all duration-200 whitespace-nowrap overflow-hidden",
                isVertical
                  ? "max-w-[160px] opacity-100 ml-3"
                  : compact
                    ? "max-w-0 opacity-0 ml-0"
                    : "max-w-[80px] opacity-100 ml-2",
              )}
            >
              {appDisplayName[app]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
