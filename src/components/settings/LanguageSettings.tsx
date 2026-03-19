import { useTranslation } from "react-i18next";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";

type LanguageOption = "zh" | "en" | "ja";

interface LanguageSettingsProps {
  value: LanguageOption;
  onChange: (value: LanguageOption) => void;
}

export function LanguageSettings({ value, onChange }: LanguageSettingsProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-2">
      <header className="space-y-1">
        <h3 className="text-[16px] font-medium">{t("settings.language")}</h3>
        <p className="text-xs text-muted-foreground">
          {t("settings.languageHint")}
        </p>
      </header>
      <SegmentedControl>
        <LanguageButton active={value === "zh"} onClick={() => onChange("zh")}>
          {t("settings.languageOptionChinese")}
        </LanguageButton>
        <LanguageButton active={value === "en"} onClick={() => onChange("en")}>
          {t("settings.languageOptionEnglish")}
        </LanguageButton>
        <LanguageButton active={value === "ja"} onClick={() => onChange("ja")}>
          {t("settings.languageOptionJapanese")}
        </LanguageButton>
      </SegmentedControl>
    </section>
  );
}

interface LanguageButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function LanguageButton({ active, onClick, children }: LanguageButtonProps) {
  return (
    <SegmentedControlItem
      type="button"
      onClick={onClick}
      active={active}
      className="min-w-[96px]"
    >
      {children}
    </SegmentedControlItem>
  );
}
