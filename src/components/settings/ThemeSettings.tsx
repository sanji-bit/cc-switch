import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/theme-provider";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";

export function ThemeSettings() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <section className="space-y-2">
      <header className="space-y-1">
        <h3 className="text-[16px] font-medium">{t("settings.theme")}</h3>
        <p className="text-xs text-muted-foreground">
          {t("settings.themeHint")}
        </p>
      </header>
      <SegmentedControl>
        <ThemeButton
          active={theme === "light"}
          onClick={(e) => setTheme("light", e)}
          icon={Sun}
        >
          {t("settings.themeLight")}
        </ThemeButton>
        <ThemeButton
          active={theme === "dark"}
          onClick={(e) => setTheme("dark", e)}
          icon={Moon}
        >
          {t("settings.themeDark")}
        </ThemeButton>
        <ThemeButton
          active={theme === "system"}
          onClick={(e) => setTheme("system", e)}
          icon={Monitor}
        >
          {t("settings.themeSystem")}
        </ThemeButton>
      </SegmentedControl>
    </section>
  );
}

interface ThemeButtonProps {
  active: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function ThemeButton({
  active,
  onClick,
  icon: Icon,
  children,
}: ThemeButtonProps) {
  return (
    <SegmentedControlItem
      type="button"
      onClick={onClick}
      active={active}
      className="min-w-[96px] gap-1.5"
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </SegmentedControlItem>
  );
}
