import { useTranslation } from "react-i18next";
import type { SettingsFormState } from "@/hooks/useSettings";
import { AppWindowMac, ArrowRight, Blocks, Power, EyeOff, Search } from "lucide-react";
import { ToggleRow } from "@/components/ui/toggle-row";
import { AnimatePresence, motion } from "framer-motion";

interface WindowSettingsProps {
  settings: SettingsFormState;
  onChange: (updates: Partial<SettingsFormState>) => void;
}

export function WindowSettings({ settings, onChange }: WindowSettingsProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-[16px] font-medium">{t("settings.windowBehavior")}</h3>
      </div>

      <div className="overflow-hidden rounded-[12px] border border-border/60 bg-card">
        <ToggleRow
          className="rounded-none bg-card hover:bg-muted/30"
          contentClassName="min-w-0"
          icon={<Power className="h-4 w-4 text-muted-foreground" />}
          title={t("settings.launchOnStartup")}
          description={t("settings.launchOnStartupDescription")}
          checked={!!settings.launchOnStartup}
          onCheckedChange={(value) => onChange({ launchOnStartup: value })}
        />

        <AnimatePresence initial={false}>
          {settings.launchOnStartup && (
            <motion.div
              key="silent-startup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="relative before:absolute before:left-4 before:right-4 before:top-0 before:h-px before:scale-y-50 before:bg-border/60 before:content-['']"
            >
              <ToggleRow
                className="rounded-none bg-card hover:bg-muted/30"
                contentClassName="min-w-0"
                icon={<EyeOff className="h-4 w-4 text-muted-foreground" />}
                title={t("settings.silentStartup")}
                description={t("settings.silentStartupDescription")}
                checked={!!settings.silentStartup}
                onCheckedChange={(value) => onChange({ silentStartup: value })}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative before:absolute before:left-4 before:right-4 before:top-0 before:h-px before:scale-y-50 before:bg-border/60 before:content-['']">
          <ToggleRow
            className="rounded-none bg-card hover:bg-muted/30"
            contentClassName="min-w-0"
            icon={<Blocks className="h-4 w-4 text-muted-foreground" />}
            title={t("settings.enableClaudePluginIntegration")}
            description={t("settings.enableClaudePluginIntegrationDescription")}
            checked={!!settings.enableClaudePluginIntegration}
            onCheckedChange={(value) =>
              onChange({ enableClaudePluginIntegration: value })
            }
          />
        </div>

        <div className="relative before:absolute before:left-4 before:right-4 before:top-0 before:h-px before:scale-y-50 before:bg-border/60 before:content-['']">
          <ToggleRow
            className="rounded-none bg-card hover:bg-muted/30"
            contentClassName="min-w-0"
            icon={<ArrowRight className="h-4 w-4 text-muted-foreground" />}
            title={t("settings.skipClaudeOnboarding")}
            description={t("settings.skipClaudeOnboardingDescription")}
            checked={!!settings.skipClaudeOnboarding}
            onCheckedChange={(value) => onChange({ skipClaudeOnboarding: value })}
          />
        </div>

        <div className="relative before:absolute before:left-4 before:right-4 before:top-0 before:h-px before:scale-y-50 before:bg-border/60 before:content-['']">
          <ToggleRow
            className="rounded-none bg-card hover:bg-muted/30"
            contentClassName="min-w-0"
            icon={<Search className="h-4 w-4 text-muted-foreground" />}
            title={t("settings.toolSearchBypass")}
            description={t("settings.toolSearchBypassDescription")}
            checked={!!settings.toolSearchBypass}
            onCheckedChange={(value) => onChange({ toolSearchBypass: value })}
          />
        </div>

        <div className="relative before:absolute before:left-4 before:right-4 before:top-0 before:h-px before:scale-y-50 before:bg-border/60 before:content-['']">
          <ToggleRow
            className="rounded-none bg-card hover:bg-muted/30"
            contentClassName="min-w-0"
            icon={<AppWindowMac className="h-4 w-4 text-muted-foreground" />}
            title={t("settings.minimizeToTray")}
            description={t("settings.minimizeToTrayDescription")}
            checked={settings.minimizeToTrayOnClose}
            onCheckedChange={(value) =>
              onChange({ minimizeToTrayOnClose: value })
            }
          />
        </div>
      </div>
    </section>
  );
}
