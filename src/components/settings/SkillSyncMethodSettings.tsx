import { useTranslation } from "react-i18next";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import type { SkillSyncMethod } from "@/types";

export interface SkillSyncMethodSettingsProps {
  value: SkillSyncMethod;
  onChange: (value: SkillSyncMethod) => void;
}

export function SkillSyncMethodSettings({
  value,
  onChange,
}: SkillSyncMethodSettingsProps) {
  const { t } = useTranslation();

  // Handle default values: undefined or "auto" defaults to symlink display
  const displayValue = value === "copy" ? "copy" : "symlink";

  return (
    <section className="space-y-2">
      <header className="space-y-1">
        <h3 className="text-[16px] font-medium">{t("settings.skillSync.title")}</h3>
        <p className="text-xs text-muted-foreground">
          {t("settings.skillSync.description")}
        </p>
      </header>
      <SegmentedControl>
        <SyncMethodButton
          active={displayValue === "symlink"}
          onClick={() => onChange("symlink")}
        >
          {t("settings.skillSync.symlink")}
        </SyncMethodButton>
        <SyncMethodButton
          active={displayValue === "copy"}
          onClick={() => onChange("copy")}
        >
          {t("settings.skillSync.copy")}
        </SyncMethodButton>
      </SegmentedControl>
      {displayValue === "symlink" && (
        <p className="text-xs text-muted-foreground">
          {t("settings.skillSync.symlinkHint")}
        </p>
      )}
    </section>
  );
}

interface SyncMethodButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function SyncMethodButton({
  active,
  onClick,
  children,
}: SyncMethodButtonProps) {
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
