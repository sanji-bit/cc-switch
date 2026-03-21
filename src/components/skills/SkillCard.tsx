import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Download, Trash2, Loader2 } from "lucide-react";
import { settingsApi } from "@/lib/api";
import type { DiscoverableSkill } from "@/lib/api/skills";

type SkillCardSkill = DiscoverableSkill & { installed: boolean };

interface SkillCardProps {
  skill: SkillCardSkill;
  onInstall: (directory: string) => Promise<void>;
  onUninstall: (directory: string) => Promise<void>;
}

export function SkillCard({ skill, onInstall, onUninstall }: SkillCardProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleInstall = async () => {
    setLoading(true);
    try {
      await onInstall(skill.directory);
    } finally {
      setLoading(false);
    }
  };

  const handleUninstall = async () => {
    setLoading(true);
    try {
      await onUninstall(skill.directory);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGithub = async () => {
    if (skill.readmeUrl) {
      try {
        await settingsApi.openExternal(skill.readmeUrl);
      } catch (error) {
        console.error("Failed to open URL:", error);
      }
    }
  };

  const showDirectory =
    Boolean(skill.directory) &&
    skill.directory.trim().toLowerCase() !== skill.name.trim().toLowerCase();

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-[16px] border-[0.5px] border-border/80 bg-card text-card-foreground shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)]">
      <CardHeader className="px-4 py-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base font-semibold leading-6">
              {skill.name}
            </CardTitle>
            <div className="mt-1.5 flex items-center gap-2">
              {showDirectory && (
                <CardDescription className="truncate text-xs">
                  {skill.directory}
                </CardDescription>
              )}
              {skill.repoOwner && skill.repoName && (
                <Badge
                  variant="outline"
                  className="h-4 shrink-0 border-border-default px-1.5 py-0 text-[10px]"
                >
                  {skill.repoOwner}/{skill.repoName}
                </Badge>
              )}
            </div>
          </div>
          {skill.installed && (
            <Badge
              variant="default"
              className="shrink-0 border-0 bg-green-600/90 text-white hover:bg-green-600 dark:bg-green-700/90 dark:hover:bg-green-700"
            >
              {t("skills.installed")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-4 pt-0 pb-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground/90">
          {skill.description || t("skills.noDescription")}
        </p>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between gap-3 border-t-[0.5px] border-border/50 px-4 pt-3 pb-3">
        {skill.readmeUrl ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenGithub}
            disabled={loading}
            className="h-auto px-0 py-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            {t("skills.view")}
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        ) : (
          <div />
        )}
        <div className="flex shrink-0 items-center gap-2">
          {skill.installed ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUninstall}
              disabled={loading}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              {loading ? t("skills.uninstalling") : t("skills.uninstall")}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleInstall}
              disabled={loading || !skill.repoOwner}
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="mr-1.5 h-3.5 w-3.5" />
              )}
              {loading ? t("skills.installing") : t("skills.install")}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
