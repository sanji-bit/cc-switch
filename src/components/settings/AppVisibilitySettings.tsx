import { useTranslation } from "react-i18next";
import { ProviderIcon } from "@/components/ProviderIcon";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import type { SettingsFormState } from "@/hooks/useSettings";
import type { VisibleApps } from "@/types";
import type { AppId } from "@/lib/api";

interface AppVisibilitySettingsProps {
  settings: SettingsFormState;
  onChange: (updates: Partial<SettingsFormState>) => void;
}

const APP_CONFIG: Array<{
  id: AppId;
  icon: string;
  nameKey: string;
}> = [
  { id: "claude", icon: "claude", nameKey: "apps.claude" },
  { id: "codex", icon: "openai", nameKey: "apps.codex" },
  { id: "gemini", icon: "gemini", nameKey: "apps.gemini" },
  { id: "opencode", icon: "opencode", nameKey: "apps.opencode" },
  { id: "openclaw", icon: "openclaw", nameKey: "apps.openclaw" },
];

export function AppVisibilitySettings({
  settings,
  onChange,
}: AppVisibilitySettingsProps) {
  const { t } = useTranslation();

  const visibleApps: VisibleApps = settings.visibleApps ?? {
    claude: true,
    codex: true,
    gemini: true,
    opencode: true,
    openclaw: true,
  };

  // Count how many apps are currently visible
  const visibleCount = Object.values(visibleApps).filter(Boolean).length;

  const handleToggle = (appId: AppId) => {
    const isCurrentlyVisible = visibleApps[appId];
    // Prevent disabling the last visible app
    if (isCurrentlyVisible && visibleCount <= 1) return;

    onChange({
      visibleApps: {
        ...visibleApps,
        [appId]: !isCurrentlyVisible,
      },
    });
  };

  return (
    <section className="space-y-2">
      <header className="space-y-1">
        <h3 className="text-[16px] font-medium">
          {t("settings.appVisibility.title")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t("settings.appVisibility.description")}
        </p>
      </header>
      <SegmentedControl className="flex max-w-full flex-wrap">
        {APP_CONFIG.map((app) => {
          const isVisible = visibleApps[app.id];
          // Disable button if this is the last visible app
          const isDisabled = isVisible && visibleCount <= 1;

          return (
            <AppButton
              key={app.id}
              active={isVisible}
              disabled={isDisabled}
              onClick={() => handleToggle(app.id)}
              icon={app.icon}
              name={t(app.nameKey)}
            >
              {t(app.nameKey)}
            </AppButton>
          );
        })}
      </SegmentedControl>
    </section>
  );
}

interface AppButtonProps {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: string;
  name: string;
  children: React.ReactNode;
}

function AppButton({
  active,
  disabled,
  onClick,
  icon,
  name,
  children,
}: AppButtonProps) {
  return (
    <SegmentedControlItem
      type="button"
      onClick={onClick}
      disabled={disabled}
      active={active}
      className="w-[90px] gap-1.5"
    >
      <ProviderIcon icon={icon} name={name} size={14} />
      {children}
    </SegmentedControlItem>
  );
}
