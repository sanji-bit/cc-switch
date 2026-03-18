import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import type { Provider } from "@/types";
import type { AppId } from "@/lib/api";
import type { StreamCheckResult } from "@/lib/api/model-test";
import { cn } from "@/lib/utils";
import { ProviderActions } from "@/components/providers/ProviderActions";
import { ProviderIcon } from "@/components/ProviderIcon";
import UsageFooter from "@/components/UsageFooter";
import { ProviderHealthBadge } from "@/components/providers/ProviderHealthBadge";
import { FailoverPriorityBadge } from "@/components/providers/FailoverPriorityBadge";
import { extractCodexBaseUrl } from "@/utils/providerConfigUtils";
import { useProviderHealth } from "@/lib/query/failover";
import { useUsageQuery } from "@/lib/query/queries";

interface DragHandleProps {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  isDragging: boolean;
}

interface ProviderCardProps {
  provider: Provider;
  isCurrent: boolean;
  appId: AppId;
  isInConfig?: boolean; // OpenCode: 是否已添加到 opencode.json
  isOmo?: boolean;
  isOmoSlim?: boolean;
  onSwitch: (provider: Provider) => void;
  onEdit: (provider: Provider) => void;
  onDelete: (provider: Provider) => void;
  onRemoveFromConfig?: (provider: Provider) => void;
  onDisableOmo?: () => void;
  onDisableOmoSlim?: () => void;
  onConfigureUsage: (provider: Provider) => void;
  onOpenWebsite: (url: string) => void;
  onDuplicate: (provider: Provider) => void;
  onTest?: (provider: Provider) => void;
  onOpenTerminal?: (provider: Provider) => void;
  isTesting?: boolean;
  lastTestResult?: StreamCheckResult | null;
  isProxyRunning: boolean;
  isProxyTakeover?: boolean; // 代理接管模式（Live配置已被接管，切换为热切换）
  dragHandleProps?: DragHandleProps;
  isAutoFailoverEnabled?: boolean; // 是否开启自动故障转移
  failoverPriority?: number; // 故障转移优先级（1 = P1, 2 = P2, ...）
  isInFailoverQueue?: boolean; // 是否在故障转移队列中
  onToggleFailover?: (enabled: boolean) => void; // 切换故障转移队列
  activeProviderId?: string; // 代理当前实际使用的供应商 ID（用于故障转移模式下标注绿色边框）
  // OpenClaw: default model
  isDefaultModel?: boolean;
  onSetAsDefault?: () => void;
}

const extractApiUrl = (provider: Provider, fallbackText: string) => {
  if (provider.notes?.trim()) {
    return provider.notes.trim();
  }

  if (provider.websiteUrl) {
    return provider.websiteUrl;
  }

  const config = provider.settingsConfig;

  if (config && typeof config === "object") {
    const envBase =
      (config as Record<string, any>)?.env?.ANTHROPIC_BASE_URL ||
      (config as Record<string, any>)?.env?.GOOGLE_GEMINI_BASE_URL;
    if (typeof envBase === "string" && envBase.trim()) {
      return envBase;
    }

    const baseUrl = (config as Record<string, any>)?.config;

    if (typeof baseUrl === "string" && baseUrl.includes("base_url")) {
      const extractedBaseUrl = extractCodexBaseUrl(baseUrl);
      if (extractedBaseUrl) {
        return extractedBaseUrl;
      }
    }
  }

  return fallbackText;
};

export function ProviderCard({
  provider,
  isCurrent,
  appId,
  isInConfig = true,
  isOmo = false,
  isOmoSlim = false,
  onSwitch,
  onEdit,
  onDelete,
  onRemoveFromConfig,
  onDisableOmo,
  onDisableOmoSlim,
  onConfigureUsage,
  onOpenWebsite,
  onDuplicate,
  onTest,
  onOpenTerminal,
  isTesting,
  lastTestResult,
  isProxyRunning,
  isProxyTakeover = false,
  dragHandleProps,
  isAutoFailoverEnabled = false,
  failoverPriority,
  isInFailoverQueue = false,
  onToggleFailover,
  activeProviderId,
  // OpenClaw: default model
  isDefaultModel,
  onSetAsDefault,
}: ProviderCardProps) {
  const { t } = useTranslation();

  // OMO and OMO Slim share the same card behavior
  const isAnyOmo = isOmo || isOmoSlim;
  const handleDisableAnyOmo = isOmoSlim ? onDisableOmoSlim : onDisableOmo;

  const { data: health } = useProviderHealth(provider.id, appId);

  const fallbackUrlText = t("provider.notConfigured", {
    defaultValue: "未配置接口地址",
  });

  const displayUrl = useMemo(() => {
    return extractApiUrl(provider, fallbackUrlText);
  }, [provider, fallbackUrlText]);

  const isClickableUrl = useMemo(() => {
    if (provider.notes?.trim()) {
      return false;
    }
    if (displayUrl === fallbackUrlText) {
      return false;
    }
    return true;
  }, [provider.notes, displayUrl, fallbackUrlText]);

  const usageEnabled = provider.meta?.usage_script?.enabled ?? false;

  // 获取用量数据以判断是否有多套餐
  // 累加模式应用（OpenCode/OpenClaw）：使用 isInConfig 代替 isCurrent
  const shouldAutoQuery =
    appId === "opencode" || appId === "openclaw" ? isInConfig : isCurrent;
  const autoQueryInterval = shouldAutoQuery
    ? provider.meta?.usage_script?.autoQueryInterval || 0
    : 0;

  const { data: usage } = useUsageQuery(provider.id, appId, {
    enabled: usageEnabled,
    autoQueryInterval,
  });

  const hasMultiplePlans =
    usage?.success && usage.data && usage.data.length > 1;

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (hasMultiplePlans) {
      setIsExpanded(true);
    }
  }, [hasMultiplePlans]);

  const handleOpenWebsite = () => {
    if (!isClickableUrl) {
      return;
    }
    onOpenWebsite(displayUrl);
  };

  // 判断是否是"当前使用中"的供应商
  // - OMO/OMO Slim 供应商：使用 isCurrent
  // - OpenClaw：使用默认模型归属的 provider 作为当前项（蓝色边框）
  // - OpenCode（非 OMO）：不存在"当前"概念，返回 false
  // - 故障转移模式：代理实际使用的供应商（activeProviderId）
  // - 普通模式：isCurrent
  const isActiveProvider = isAnyOmo
    ? isCurrent
    : appId === "openclaw"
      ? Boolean(isDefaultModel)
      : appId === "opencode"
        ? false
        : isAutoFailoverEnabled
          ? activeProviderId === provider.id
          : isCurrent;

  const shouldUseGreen = !isAnyOmo && isProxyTakeover && isActiveProvider;
  const shouldUseBlue =
    (isAnyOmo && isActiveProvider) ||
    (!isAnyOmo && !isProxyTakeover && isActiveProvider);
  const hasPassedTest = lastTestResult?.status === "operational";

  return (
    <div
      className={cn(
        "group flex h-full w-full max-w-[480px] flex-col overflow-hidden rounded-[24px] border border-border/80 bg-card text-card-foreground transition-shadow duration-200",
        shouldUseGreen && "border-emerald-500/80 shadow-sm shadow-emerald-500/10",
        shouldUseBlue && "border-blue-500/90 shadow-sm shadow-blue-500/10",
        !shouldUseGreen && !shouldUseBlue && "hover:shadow-lg",
        dragHandleProps?.isDragging &&
          "z-10 scale-[1.02] cursor-grabbing border-primary shadow-lg",
      )}
    >
      <div className="flex items-center gap-4 px-4 py-4">
        <button
          type="button"
          className={cn(
            "relative flex h-[72px] w-[72px] flex-shrink-0 cursor-grab items-center justify-center self-center rounded-[16px] border border-border bg-muted/35 active:cursor-grabbing",
            dragHandleProps?.isDragging && "cursor-grabbing",
          )}
          aria-label={t("provider.dragHandle")}
          {...(dragHandleProps?.attributes ?? {})}
          {...(dragHandleProps?.listeners ?? {})}
        >
          <ProviderIcon
            icon={provider.icon}
            name={provider.name}
            color={provider.iconColor}
            size={40}
          />
          {hasPassedTest && (
            <span className="absolute bottom-0 right-0 flex h-5 w-5 translate-x-1 translate-y-1 items-center justify-center rounded-full border-[3px] border-card bg-emerald-500" />
          )}
        </button>

        <div className="flex min-w-0 flex-1 items-center">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-[18px] font-semibold leading-5 text-foreground">
                  {provider.name}
                </h3>

                {isOmo && (
                  <span className="inline-flex items-center rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                    OMO
                  </span>
                )}

                {isOmoSlim && (
                  <span className="inline-flex items-center rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    Slim
                  </span>
                )}

                {isProxyRunning && isInFailoverQueue && health && (
                  <ProviderHealthBadge
                    consecutiveFailures={health.consecutive_failures}
                  />
                )}

                {isAutoFailoverEnabled &&
                  isInFailoverQueue &&
                  failoverPriority && (
                    <FailoverPriorityBadge priority={failoverPriority} />
                  )}

                {provider.category === "third_party" &&
                  provider.meta?.isPartner && (
                    <span
                      className="text-yellow-500 dark:text-yellow-400"
                      title={t("provider.officialPartner", {
                        defaultValue: "官方合作伙伴",
                      })}
                    >
                      ⭐
                    </span>
                  )}
              </div>

              {displayUrl && (
                <button
                  type="button"
                  onClick={handleOpenWebsite}
                  className={cn(
                    "mt-1.5 block max-w-full text-left text-[15px] leading-5 text-muted-foreground",
                    isClickableUrl
                      ? "transition-colors hover:text-foreground"
                      : "cursor-default",
                  )}
                  title={displayUrl}
                  disabled={!isClickableUrl}
                >
                  <span className="line-clamp-1">{displayUrl}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="mt-auto px-4 pb-3">
        <div className="border-t border-border/50 pt-3">
          <ProviderActions
            appId={appId}
            isCurrent={isCurrent}
            isInConfig={isInConfig}
            isTesting={isTesting}
            isProxyTakeover={isProxyTakeover}
            isOmo={isAnyOmo}
            onSwitch={() => onSwitch(provider)}
            onEdit={() => onEdit(provider)}
            onDuplicate={() => onDuplicate(provider)}
            onTest={onTest ? () => onTest(provider) : undefined}
            onConfigureUsage={() => onConfigureUsage(provider)}
            onDelete={() => onDelete(provider)}
            onRemoveFromConfig={
              onRemoveFromConfig ? () => onRemoveFromConfig(provider) : undefined
            }
            onDisableOmo={handleDisableAnyOmo}
            onOpenTerminal={
              onOpenTerminal ? () => onOpenTerminal(provider) : undefined
            }
            isAutoFailoverEnabled={isAutoFailoverEnabled}
            isInFailoverQueue={isInFailoverQueue}
            onToggleFailover={onToggleFailover}
            isDefaultModel={isDefaultModel}
            onSetAsDefault={onSetAsDefault}
          />
        </div>
      </div>

      {isExpanded && hasMultiplePlans && (
        <div className="px-4 py-4">
          <div className="border-t border-border/50 px-4 pt-4">
            <UsageFooter
              provider={provider}
              providerId={provider.id}
              appId={appId}
              usageEnabled={usageEnabled}
              isCurrent={isCurrent}
              isInConfig={isInConfig}
              inline={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
