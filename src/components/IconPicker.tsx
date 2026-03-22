import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProviderIcon } from "./ProviderIcon";
import { iconList } from "@/icons/extracted";
import { searchIcons, getIconMetadata } from "@/icons/extracted/metadata";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value?: string; // 当前选中的图标
  onValueChange: (icon: string) => void; // 选择回调
  color?: string; // 预览颜色
  variant?: "default" | "compact";
  showSearch?: boolean;
  previewName?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onValueChange,
  variant = "default",
  showSearch,
  previewName = "A",
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const isCompact = variant === "compact";
  const shouldShowSearch = showSearch ?? !isCompact;
  const prioritizedIcons = [
    "claude",
    "openai",
    "gemini",
    "opencode",
    "openclaw",
    "anthropic",
    "kimi",
    "deepseek",
    "doubao",
    "qwen",
  ];

  // 过滤图标列表
  const filteredIcons = useMemo(() => {
    const baseIcons = !searchQuery ? iconList : searchIcons(searchQuery);
    const prioritySet = new Set(prioritizedIcons);
    const sortedIcons = [
      ...prioritizedIcons.filter((icon) => baseIcons.includes(icon)),
      ...baseIcons.filter((icon) => !prioritySet.has(icon)),
    ];
    return sortedIcons;
  }, [searchQuery]);

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", isCompact && "space-y-3")}>
        {shouldShowSearch && (
          <div>
            {!isCompact && (
              <Label htmlFor="icon-search">
                {t("iconPicker.search", { defaultValue: "搜索图标" })}
              </Label>
            )}
            <Input
              id="icon-search"
              type="text"
              placeholder={t("iconPicker.searchPlaceholder", {
                defaultValue: "输入图标名称...",
              })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                isCompact
                  ? "rounded-full border-transparent bg-muted shadow-none ring-0 outline-none hover:border-transparent hover:ring-0 focus:border-transparent focus:ring-0 focus-visible:border-transparent focus-visible:ring-0"
                  : "mt-2",
              )}
            />
          </div>
        )}

        <div className={cn(isCompact ? "overflow-visible" : "max-h-[65vh] overflow-y-auto pr-1")}>
          <div
            className={cn(
              isCompact
                ? "grid grid-cols-8 justify-items-center gap-x-2 gap-y-2"
                : "grid gap-2 grid-cols-6 sm:grid-cols-8 lg:grid-cols-10",
            )}
          >
            {["__fallback__", ...filteredIcons].map((iconName) => {
              const isFallbackOption = iconName === "__fallback__";
              const meta = isFallbackOption ? null : getIconMetadata(iconName);
              const isSelected = isFallbackOption ? !value : value === iconName;
              const label = isFallbackOption
                ? t("providerIcon.useInitials", { defaultValue: "使用名称首字母" })
                : meta?.displayName || iconName;
              const button = (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => onValueChange(isFallbackOption ? "" : iconName)}
                  className={cn(
                    "transition-all duration-200",
                    isCompact
                      ? [
                          "flex h-12 w-12 items-center justify-center rounded-[12px] border border-black/8 bg-background dark:border-white/10",
                          "hover:border-primary/50 hover:bg-accent",
                          isSelected
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "",
                        ]
                      : [
                          "flex flex-col items-center gap-1 p-3 rounded-lg",
                          "border-2 hover:bg-accent hover:border-primary/50",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-transparent",
                        ],
                  )}
                  aria-label={label}
                >
                  <ProviderIcon
                    icon={isFallbackOption ? undefined : iconName}
                    name={isFallbackOption ? previewName : iconName}
                    size={isCompact ? 24 : 32}
                  />
                  {!isCompact && (
                    <span className="text-xs text-muted-foreground truncate w-full text-center">
                      {label}
                    </span>
                  )}
                </button>
              );

              if (!isCompact) {
                return button;
              }

              return (
                <Tooltip key={iconName}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="bottom">{label}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {filteredIcons.length === 0 && (
          <div className={cn("text-center text-muted-foreground", isCompact ? "py-4 text-sm" : "py-8")}>
            {t("iconPicker.noResults", { defaultValue: "未找到匹配的图标" })}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
