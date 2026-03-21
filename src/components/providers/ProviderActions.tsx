import type { ReactNode } from "react";
import {
  ChartPie,
  Copy,
  Loader2,
  Pencil,
  Terminal,
  Trash,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AppId } from "@/lib/api";

interface ProviderActionsProps {
  appId?: AppId;
  isCurrent: boolean;
  isInConfig?: boolean;
  isTesting?: boolean;
  isProxyTakeover?: boolean;
  isHovered?: boolean;
  isOmo?: boolean;
  onSwitch: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onTest?: () => void;
  onConfigureUsage: () => void;
  onDelete: () => void;
  onRemoveFromConfig?: () => void;
  onDisableOmo?: () => void;
  onOpenTerminal?: () => void;
  isAutoFailoverEnabled?: boolean;
  isInFailoverQueue?: boolean;
  onToggleFailover?: (enabled: boolean) => void;
  // OpenClaw: default model
  isDefaultModel?: boolean;
  onSetAsDefault?: () => void;
}

export function ProviderActions({
  appId,
  isCurrent,
  isInConfig = false,
  isTesting,
  isProxyTakeover = false,
  isHovered = false,
  isOmo = false,
  onSwitch,
  onEdit,
  onDuplicate,
  onTest,
  onConfigureUsage,
  onDelete,
  onRemoveFromConfig,
  onDisableOmo,
  onOpenTerminal,
  isAutoFailoverEnabled = false,
  isInFailoverQueue = false,
  onToggleFailover,
  // OpenClaw: default model
  isDefaultModel = false,
  onSetAsDefault,
}: ProviderActionsProps) {
  const { t } = useTranslation();
  const iconButtonClass = cn(
    "h-8 w-8 rounded-[8px] p-1 text-muted-foreground transition-colors",
    isHovered
      ? "opacity-100 hover:bg-muted/70 hover:text-foreground"
      : "opacity-40",
  );

  // 累加模式应用（OpenCode 非 OMO 和 OpenClaw）
  const isAdditiveMode =
    (appId === "opencode" && !isOmo) || appId === "openclaw";

  // 故障转移模式下的按钮逻辑（累加模式和 OMO 应用不支持故障转移）
  const isFailoverMode =
    !isAdditiveMode && !isOmo && isAutoFailoverEnabled && onToggleFailover;

  const handleMainButtonClick = () => {
    if (isOmo) {
      if (isCurrent) {
        onDisableOmo?.();
      } else {
        onSwitch();
      }
    } else if (isAdditiveMode) {
      // 累加模式：切换配置状态（添加/移除）
      if (isInConfig) {
        if (onRemoveFromConfig) {
          onRemoveFromConfig();
        } else {
          onDelete();
        }
      } else {
        onSwitch(); // 添加到配置
      }
    } else if (isFailoverMode) {
      onToggleFailover(!isInFailoverQueue);
    } else {
      onSwitch();
    }
  };

  const getMainSwitchState = () => {
    if (isAdditiveMode) {
      return {
        checked: isInConfig,
        disabled: isDefaultModel === true,
        text: isInConfig
          ? t("provider.inUse")
          : t("provider.enable"),
      };
    }

    if (isFailoverMode) {
      return {
        checked: isInFailoverQueue,
        disabled: false,
        text: isInFailoverQueue
          ? t("provider.inUse")
          : t("provider.enable"),
      };
    }

    return {
      checked: isCurrent,
      disabled: false,
      text: isCurrent ? t("provider.inUse") : t("provider.enable"),
    };
  };

  const switchState = getMainSwitchState();

  const canDelete = isOmo || isAdditiveMode ? true : !isCurrent;

  return (
    <div className="flex w-full items-center gap-3">
      <TooltipProvider>
        <div className="flex items-center gap-1">
          <ActionTooltipButton
            label={t("common.edit")}
            icon={<Pencil className="h-4 w-4" />}
            onClick={onEdit}
            className={iconButtonClass}
          />

          <ActionTooltipButton
            label={t("provider.duplicate")}
            icon={<Copy className="h-4 w-4" />}
            onClick={onDuplicate}
            className={iconButtonClass}
          />

          {onTest && (
            <ActionTooltipButton
              label={t("modelTest.testProvider", "测试模型")}
              icon={
                isTesting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )
              }
              onClick={onTest}
              disabled={isTesting}
              className={iconButtonClass}
            />
          )}

          <ActionTooltipButton
            label={t("provider.configureUsage")}
            icon={<ChartPie className="h-4 w-4" />}
            onClick={onConfigureUsage}
            className={iconButtonClass}
          />

          {onOpenTerminal && (
            <ActionTooltipButton
              label={t("provider.openTerminal", "打开终端")}
              icon={<Terminal className="h-4 w-4" />}
              onClick={onOpenTerminal}
              className={cn(
                iconButtonClass,
                "hover:text-emerald-600 dark:hover:text-emerald-400",
              )}
            />
          )}

          <ActionTooltipButton
            label={t("common.delete")}
            icon={<Trash className="h-4 w-4" />}
            onClick={canDelete ? onDelete : undefined}
            disabled={!canDelete}
            className={cn(
              iconButtonClass,
              canDelete && "hover:text-red-500 dark:hover:text-red-400",
              !canDelete && "opacity-40 cursor-not-allowed text-muted-foreground",
            )}
          />
        </div>
      </TooltipProvider>

      <div className="ml-auto flex items-center gap-2">
        {appId === "openclaw" && isInConfig && onSetAsDefault && (
          <Button
            size="sm"
            variant={isDefaultModel ? "secondary" : "default"}
            onClick={isDefaultModel ? undefined : onSetAsDefault}
            disabled={isDefaultModel}
            className={cn(
              "h-8 rounded-lg px-2.5 text-xs font-medium",
              isDefaultModel
                ? "bg-gray-200 text-muted-foreground opacity-60 cursor-not-allowed dark:bg-gray-700"
                : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            {isDefaultModel
              ? t("provider.isDefault", { defaultValue: "当前默认" })
              : t("provider.setAsDefault", { defaultValue: "设为默认" })}
          </Button>
        )}

        <Switch
          checked={switchState.checked}
          onCheckedChange={handleMainButtonClick}
          disabled={switchState.disabled}
          aria-label={switchState.text}
        />
      </div>
    </div>
  );
}

interface ActionTooltipButtonProps {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

function ActionTooltipButton({
  label,
  icon,
  onClick,
  disabled = false,
  className,
}: ActionTooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button
            size="icon"
            variant="ghost"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={className}
          >
            {icon}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}
