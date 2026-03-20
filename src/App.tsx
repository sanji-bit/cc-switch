import { useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Settings,
  Wrench,
  RefreshCw,
  History,
  BarChart2,
  Download,
  FolderArchive,
  Search,
  FolderOpen,
  KeyRound,
  Shield,
  Cpu,
  Layers3,
} from "lucide-react";
import type { Provider, VisibleApps } from "@/types";
import type { EnvConflict } from "@/types/env";
import { useProvidersQuery, useSettingsQuery } from "@/lib/query";
import {
  providersApi,
  promptsApi,
  settingsApi,
  type AppId,
  type ProviderSwitchEvent,
} from "@/lib/api";
import { checkAllEnvConflicts, checkEnvConflicts } from "@/lib/api/env";
import { useProviderActions } from "@/hooks/useProviderActions";
import { openclawKeys, useOpenClawHealth } from "@/hooks/useOpenClaw";
import { useProxyStatus } from "@/hooks/useProxyStatus";
import { useLastValidValue } from "@/hooks/useLastValidValue";
import { extractErrorMessage } from "@/utils/errorUtils";
import { isTextEditableTarget } from "@/utils/domUtils";
import { cn } from "@/lib/utils";
import { isWindows, isLinux } from "@/lib/platform";
import { AppSwitcher } from "@/components/AppSwitcher";
import { ProviderList } from "@/components/providers/ProviderList";
import { AddProviderDialog } from "@/components/providers/AddProviderDialog";
import { EditProviderDialog } from "@/components/providers/EditProviderDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { UpdateBadge } from "@/components/UpdateBadge";
import { EnvWarningBanner } from "@/components/env/EnvWarningBanner";
import { ProxyToggle } from "@/components/proxy/ProxyToggle";
import { FailoverToggle } from "@/components/proxy/FailoverToggle";
import UsageScriptModal from "@/components/UsageScriptModal";
import UnifiedMcpPanel from "@/components/mcp/UnifiedMcpPanel";
import PromptPanel from "@/components/prompts/PromptPanel";
import { SkillsPage } from "@/components/skills/SkillsPage";
import UnifiedSkillsPanel from "@/components/skills/UnifiedSkillsPanel";
import { DeepLinkImportDialog } from "@/components/DeepLinkImportDialog";
import { AgentsPanel } from "@/components/agents/AgentsPanel";
import { UniversalProviderPanel } from "@/components/universal";
import { Button } from "@/components/ui/button";
import { SessionManagerPage } from "@/components/sessions/SessionManagerPage";
import {
  useDisableCurrentOmo,
  useDisableCurrentOmoSlim,
} from "@/lib/query/omo";
import WorkspaceFilesPanel from "@/components/workspace/WorkspaceFilesPanel";
import EnvPanel from "@/components/openclaw/EnvPanel";
import ToolsPanel from "@/components/openclaw/ToolsPanel";
import AgentsDefaultsPanel from "@/components/openclaw/AgentsDefaultsPanel";
import OpenClawHealthBanner from "@/components/openclaw/OpenClawHealthBanner";

type View =
  | "providers"
  | "settings"
  | "prompts"
  | "skills"
  | "skillsDiscovery"
  | "mcp"
  | "agents"
  | "universal"
  | "sessions"
  | "workspace"
  | "openclawEnv"
  | "openclawTools"
  | "openclawAgents";

interface WebDavSyncStatusUpdatedPayload {
  source?: string;
  status?: string;
  error?: string;
}

interface SidebarItem {
  key: View;
  label: string;
  icon?: typeof Settings;
  iconNode?: React.ReactNode;
  hidden?: boolean;
}

interface ContextTabItem {
  key: View;
  label: string;
  hidden?: boolean;
}

const DRAG_BAR_HEIGHT = isWindows() || isLinux() ? 0 : 28; // px
const HEADER_HEIGHT = 64; // px

const STORAGE_KEY = "cc-switch-last-app";
const VALID_APPS: AppId[] = [
  "claude",
  "codex",
  "gemini",
  "opencode",
  "openclaw",
];

const getInitialApp = (): AppId => {
  const saved = localStorage.getItem(STORAGE_KEY) as AppId | null;
  if (saved && VALID_APPS.includes(saved)) {
    return saved;
  }
  return "claude";
};

const VIEW_STORAGE_KEY = "cc-switch-last-view";
const VALID_VIEWS: View[] = [
  "providers",
  "settings",
  "prompts",
  "skills",
  "skillsDiscovery",
  "mcp",
  "agents",
  "universal",
  "sessions",
  "workspace",
  "openclawEnv",
  "openclawTools",
  "openclawAgents",
];

const getInitialView = (): View => {
  const saved = localStorage.getItem(VIEW_STORAGE_KEY) as View | null;
  if (saved && VALID_VIEWS.includes(saved)) {
    return saved;
  }
  return "providers";
};

function App() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [activeApp, setActiveApp] = useState<AppId>(getInitialApp);
  const [currentView, setCurrentView] = useState<View>(getInitialView);
  const [settingsDefaultTab, setSettingsDefaultTab] = useState("general");
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, currentView);
  }, [currentView]);

  const { data: settingsData } = useSettingsQuery();
  const visibleApps: VisibleApps = settingsData?.visibleApps ?? {
    claude: true,
    codex: true,
    gemini: true,
    opencode: true,
    openclaw: true,
  };

  const getFirstVisibleApp = (): AppId => {
    if (visibleApps.claude) return "claude";
    if (visibleApps.codex) return "codex";
    if (visibleApps.gemini) return "gemini";
    if (visibleApps.opencode) return "opencode";
    if (visibleApps.openclaw) return "openclaw";
    return "claude"; // fallback
  };

  useEffect(() => {
    if (!visibleApps[activeApp]) {
      setActiveApp(getFirstVisibleApp());
    }
  }, [visibleApps, activeApp]);

  // Fallback from sessions view when switching to an app without session support
  useEffect(() => {
    if (
      currentView === "sessions" &&
      activeApp !== "claude" &&
      activeApp !== "codex" &&
      activeApp !== "opencode" &&
      activeApp !== "openclaw" &&
      activeApp !== "gemini"
    ) {
      setCurrentView("providers");
    }
  }, [activeApp, currentView]);

  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [usageProvider, setUsageProvider] = useState<Provider | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    provider: Provider;
    action: "remove" | "delete";
  } | null>(null);
  const [envConflicts, setEnvConflicts] = useState<EnvConflict[]>([]);
  const [showEnvBanner, setShowEnvBanner] = useState(false);

  const effectiveEditingProvider = useLastValidValue(editingProvider);
  const effectiveUsageProvider = useLastValidValue(usageProvider);

  const toolbarRef = useRef<HTMLDivElement>(null);

  const promptPanelRef = useRef<any>(null);
  const mcpPanelRef = useRef<any>(null);
  const skillsPageRef = useRef<any>(null);
  const unifiedSkillsPanelRef = useRef<any>(null);
  const addActionButtonClass =
    "bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 dark:shadow-orange-500/40 rounded-full w-8 h-8";

  const {
    isRunning: isProxyRunning,
    takeoverStatus,
    status: proxyStatus,
  } = useProxyStatus();
  const isCurrentAppTakeoverActive = takeoverStatus?.[activeApp] || false;
  const activeProviderId = useMemo(() => {
    const target = proxyStatus?.active_targets?.find(
      (t) => t.app_type === activeApp,
    );
    return target?.provider_id;
  }, [proxyStatus?.active_targets, activeApp]);

  const { data, isLoading, refetch } = useProvidersQuery(activeApp, {
    isProxyRunning,
  });
  const providers = useMemo(() => data?.providers ?? {}, [data]);
  const providerCount = useMemo(() => Object.keys(providers).length, [providers]);
  const [promptCount, setPromptCount] = useState(0);
  const currentProviderId = data?.currentProviderId ?? "";

  useEffect(() => {
    if (currentView !== "prompts") {
      return;
    }

    let cancelled = false;

    const loadPromptCount = async () => {
      try {
        const prompts = await promptsApi.getPrompts(activeApp);
        if (!cancelled) {
          setPromptCount(Object.keys(prompts).length);
        }
      } catch {
        if (!cancelled) {
          setPromptCount(0);
        }
      }
    };

    loadPromptCount();

    return () => {
      cancelled = true;
    };
  }, [activeApp, currentView]);
  const isOpenClawView =
    activeApp === "openclaw" &&
    (currentView === "providers" ||
      currentView === "workspace" ||
      currentView === "sessions" ||
      currentView === "openclawEnv" ||
      currentView === "openclawTools" ||
      currentView === "openclawAgents");
  const { data: openclawHealthWarnings = [] } =
    useOpenClawHealth(isOpenClawView);
  const hasSkillsSupport = true;
  const hasSessionSupport =
    activeApp === "claude" ||
    activeApp === "codex" ||
    activeApp === "opencode" ||
    activeApp === "openclaw" ||
    activeApp === "gemini";

  const {
    addProvider,
    updateProvider,
    switchProvider,
    deleteProvider,
    saveUsageScript,
    setAsDefaultModel,
  } = useProviderActions(activeApp);

  const disableOmoMutation = useDisableCurrentOmo();
  const handleDisableOmo = () => {
    disableOmoMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(t("omo.disabled", { defaultValue: "OMO 已停用" }));
      },
      onError: (error: Error) => {
        toast.error(
          t("omo.disableFailed", {
            defaultValue: "停用 OMO 失败: {{error}}",
            error: extractErrorMessage(error),
          }),
        );
      },
    });
  };

  const disableOmoSlimMutation = useDisableCurrentOmoSlim();
  const handleDisableOmoSlim = () => {
    disableOmoSlimMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(t("omo.disabled", { defaultValue: "OMO 已停用" }));
      },
      onError: (error: Error) => {
        toast.error(
          t("omo.disableFailed", {
            defaultValue: "停用 OMO 失败: {{error}}",
            error: extractErrorMessage(error),
          }),
        );
      },
    });
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        unsubscribe = await providersApi.onSwitched(
          async (event: ProviderSwitchEvent) => {
            if (event.appType === activeApp) {
              await refetch();
            }
          },
        );
      } catch (error) {
        console.error("[App] Failed to subscribe provider switch event", error);
      }
    };

    setupListener();
    return () => {
      unsubscribe?.();
    };
  }, [activeApp, refetch]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        const { listen } = await import("@tauri-apps/api/event");
        unsubscribe = await listen("universal-provider-synced", async () => {
          await queryClient.invalidateQueries({ queryKey: ["providers"] });
          try {
            await providersApi.updateTrayMenu();
          } catch (error) {
            console.error("[App] Failed to update tray menu", error);
          }
        });
      } catch (error) {
        console.error(
          "[App] Failed to subscribe universal-provider-synced event",
          error,
        );
      }
    };

    setupListener();
    return () => {
      unsubscribe?.();
    };
  }, [queryClient]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;

    const setupListener = async () => {
      try {
        const off = await listen(
          "webdav-sync-status-updated",
          async (event) => {
            const payload = (event.payload ??
              {}) as WebDavSyncStatusUpdatedPayload;
            await queryClient.invalidateQueries({ queryKey: ["settings"] });

            if (payload.source !== "auto" || payload.status !== "error") {
              return;
            }

            toast.error(
              t("settings.webdavSync.autoSyncFailedToast", {
                error: payload.error || t("common.unknown"),
              }),
            );
          },
        );
        if (!active) {
          off();
          return;
        }
        unsubscribe = off;
      } catch (error) {
        console.error(
          "[App] Failed to subscribe webdav-sync-status-updated event",
          error,
        );
      }
    };

    void setupListener();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [queryClient, t]);

  useEffect(() => {
    const checkEnvOnStartup = async () => {
      try {
        const allConflicts = await checkAllEnvConflicts();
        const flatConflicts = Object.values(allConflicts).flat();

        if (flatConflicts.length > 0) {
          setEnvConflicts(flatConflicts);
          const dismissed = sessionStorage.getItem("env_banner_dismissed");
          if (!dismissed) {
            setShowEnvBanner(true);
          }
        }
      } catch (error) {
        console.error(
          "[App] Failed to check environment conflicts on startup:",
          error,
        );
      }
    };

    checkEnvOnStartup();
  }, []);

  useEffect(() => {
    const checkMigration = async () => {
      try {
        const migrated = await invoke<boolean>("get_migration_result");
        if (migrated) {
          toast.success(
            t("migration.success", { defaultValue: "配置迁移成功" }),
            { closeButton: true },
          );
        }
      } catch (error) {
        console.error("[App] Failed to check migration result:", error);
      }
    };

    checkMigration();
  }, [t]);

  useEffect(() => {
    const checkSkillsMigration = async () => {
      try {
        const result = await invoke<{ count: number; error?: string } | null>(
          "get_skills_migration_result",
        );
        if (result?.error) {
          toast.error(t("migration.skillsFailed"), {
            description: t("migration.skillsFailedDescription"),
            closeButton: true,
          });
          console.error("[App] Skills SSOT migration failed:", result.error);
          return;
        }
        if (result && result.count > 0) {
          toast.success(t("migration.skillsSuccess", { count: result.count }), {
            closeButton: true,
          });
          await queryClient.invalidateQueries({ queryKey: ["skills"] });
        }
      } catch (error) {
        console.error("[App] Failed to check skills migration result:", error);
      }
    };

    checkSkillsMigration();
  }, [t, queryClient]);

  useEffect(() => {
    const checkEnvOnSwitch = async () => {
      try {
        const conflicts = await checkEnvConflicts(activeApp);

        if (conflicts.length > 0) {
          setEnvConflicts((prev) => {
            const existingKeys = new Set(
              prev.map((c) => `${c.varName}:${c.sourcePath}`),
            );
            const newConflicts = conflicts.filter(
              (c) => !existingKeys.has(`${c.varName}:${c.sourcePath}`),
            );
            return [...prev, ...newConflicts];
          });
          const dismissed = sessionStorage.getItem("env_banner_dismissed");
          if (!dismissed) {
            setShowEnvBanner(true);
          }
        }
      } catch (error) {
        console.error(
          "[App] Failed to check environment conflicts on app switch:",
          error,
        );
      }
    };

    checkEnvOnSwitch();
  }, [activeApp]);

  const currentViewRef = useRef(currentView);

  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "," && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setCurrentView("settings");
        return;
      }

      if (event.key !== "Escape" || event.defaultPrevented) return;

      if (document.body.style.overflow === "hidden") return;

      const view = currentViewRef.current;
      if (view === "providers") return;

      if (isTextEditableTarget(event.target)) return;

      event.preventDefault();
      setCurrentView(view === "skillsDiscovery" ? "skills" : "providers");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleOpenWebsite = async (url: string) => {
    try {
      await settingsApi.openExternal(url);
    } catch (error) {
      const detail =
        extractErrorMessage(error) ||
        t("notifications.openLinkFailed", {
          defaultValue: "链接打开失败",
        });
      toast.error(detail);
    }
  };

  const handleEditProvider = async (provider: Provider) => {
    await updateProvider(provider);
    setEditingProvider(null);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { provider, action } = confirmAction;

    if (action === "remove") {
      // Remove from live config only (for additive mode apps like OpenCode/OpenClaw)
      // Does NOT delete from database - provider remains in the list
      await providersApi.removeFromLiveConfig(provider.id, activeApp);
      // Invalidate queries to refresh the isInConfig state
      if (activeApp === "opencode") {
        await queryClient.invalidateQueries({
          queryKey: ["opencodeLiveProviderIds"],
        });
      } else if (activeApp === "openclaw") {
        await queryClient.invalidateQueries({
          queryKey: openclawKeys.liveProviderIds,
        });
        await queryClient.invalidateQueries({
          queryKey: openclawKeys.health,
        });
      }
      toast.success(
        t("notifications.removeFromConfigSuccess", {
          defaultValue: "已从配置移除",
        }),
        { closeButton: true },
      );
    } else {
      await deleteProvider(provider.id);
    }
    setConfirmAction(null);
  };

  const generateUniqueOpencodeKey = (
    originalKey: string,
    existingKeys: string[],
  ): string => {
    const baseKey = `${originalKey}-copy`;

    if (!existingKeys.includes(baseKey)) {
      return baseKey;
    }

    let counter = 2;
    while (existingKeys.includes(`${baseKey}-${counter}`)) {
      counter++;
    }
    return `${baseKey}-${counter}`;
  };

  const handleDuplicateProvider = async (provider: Provider) => {
    const newSortIndex =
      provider.sortIndex !== undefined ? provider.sortIndex + 1 : undefined;

    const duplicatedProvider: Omit<Provider, "id" | "createdAt"> & {
      providerKey?: string;
    } = {
      name: `${provider.name} copy`,
      settingsConfig: JSON.parse(JSON.stringify(provider.settingsConfig)), // 深拷贝
      websiteUrl: provider.websiteUrl,
      category: provider.category,
      sortIndex: newSortIndex, // 复制原 sortIndex + 1
      meta: provider.meta
        ? JSON.parse(JSON.stringify(provider.meta))
        : undefined, // 深拷贝
      icon: provider.icon,
      iconColor: provider.iconColor,
    };

    if (activeApp === "opencode") {
      const existingKeys = Object.keys(providers);
      duplicatedProvider.providerKey = generateUniqueOpencodeKey(
        provider.id,
        existingKeys,
      );
    }

    if (provider.sortIndex !== undefined) {
      const updates = Object.values(providers)
        .filter(
          (p) =>
            p.sortIndex !== undefined &&
            p.sortIndex >= newSortIndex! &&
            p.id !== provider.id,
        )
        .map((p) => ({
          id: p.id,
          sortIndex: p.sortIndex! + 1,
        }));

      if (updates.length > 0) {
        try {
          await providersApi.updateSortOrder(updates, activeApp);
        } catch (error) {
          console.error("[App] Failed to update sort order", error);
          toast.error(
            t("provider.sortUpdateFailed", {
              defaultValue: "排序更新失败",
            }),
          );
          return; // 如果排序更新失败，不继续添加
        }
      }
    }

    await addProvider(duplicatedProvider);
  };

  const handleOpenTerminal = async (provider: Provider) => {
    try {
      await providersApi.openTerminal(provider.id, activeApp);
      toast.success(
        t("provider.terminalOpened", {
          defaultValue: "终端已打开",
        }),
      );
    } catch (error) {
      console.error("[App] Failed to open terminal", error);
      const errorMessage = extractErrorMessage(error);
      toast.error(
        t("provider.terminalOpenFailed", {
          defaultValue: "打开终端失败",
        }) + (errorMessage ? `: ${errorMessage}` : ""),
      );
    }
  };

  const handleImportSuccess = async () => {
    try {
      await queryClient.invalidateQueries({
        queryKey: ["providers"],
        refetchType: "all",
      });
      await queryClient.refetchQueries({
        queryKey: ["providers"],
        type: "all",
      });
    } catch (error) {
      console.error("[App] Failed to refresh providers after import", error);
      await refetch();
    }
    try {
      await providersApi.updateTrayMenu();
    } catch (error) {
      console.error("[App] Failed to refresh tray menu", error);
    }
  };

  const globalSidebarItems: SidebarItem[] = [
    { key: "skills", label: t("navigation.skills"), icon: Wrench, hidden: !hasSkillsSupport },
    {
      key: "mcp",
      label: t("navigation.mcp"),
      iconNode: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <g clipPath="url(#mcp-sidebar-icon-clip)">
            <path
              d="M8.28009 1.68002C9.07165 0.889616 10.0904 0.366297 11.1939 0.183215C12.2975 0.000133827 13.4306 0.166441 14.435 0.658889C15.4394 1.15134 16.2649 1.94531 16.7959 2.92983C17.327 3.91435 17.5372 5.04021 17.3971 6.15002C18.5078 6.00836 19.6349 6.21761 20.6208 6.74848C21.6066 7.27936 22.4017 8.10526 22.8948 9.11054C23.3878 10.1158 23.5541 11.2501 23.3704 12.3546C23.1866 13.4591 22.662 14.4785 21.8701 15.27L16.9321 20.2095C16.8972 20.2444 16.8695 20.2857 16.8506 20.3313C16.8316 20.3769 16.8219 20.4257 16.8219 20.475C16.8219 20.5243 16.8316 20.5732 16.8506 20.6187C16.8695 20.6643 16.8972 20.7057 16.9321 20.7405L18.1966 22.005C18.4074 22.2159 18.5259 22.5018 18.5259 22.8C18.5259 23.0982 18.4074 23.3842 18.1966 23.595C17.9857 23.8059 17.6998 23.9243 17.4016 23.9243C17.1034 23.9243 16.8174 23.8059 16.6066 23.595L15.3406 22.3305C14.8487 21.8383 14.5724 21.1709 14.5724 20.475C14.5724 19.7791 14.8487 19.1117 15.3406 18.6195L20.2801 13.68C20.8645 13.095 21.1927 12.3019 21.1927 11.475C21.1927 10.6481 20.8645 9.85504 20.2801 9.27002C19.6951 8.68562 18.902 8.35737 18.0751 8.35737C17.2482 8.35737 16.4551 8.68562 15.8701 9.27002L11.5966 13.545C11.3845 13.75 11.1004 13.8636 10.8054 13.8612C10.5104 13.8587 10.2282 13.7406 10.0195 13.5321C9.81085 13.3236 9.6924 13.0415 9.6897 12.7465C9.68699 12.4515 9.80026 12.1673 10.0051 11.955L14.2801 7.68002C14.8645 7.095 15.1927 6.30192 15.1927 5.47502C15.1927 4.64812 14.8645 3.85504 14.2801 3.27002C13.6951 2.68563 12.902 2.35737 12.0751 2.35737C11.2482 2.35737 10.4551 2.68563 9.87009 3.27002L2.67159 10.47C2.45951 10.6751 2.17538 10.7886 1.88041 10.7862C1.58543 10.7837 1.30321 10.6656 1.09453 10.4571C0.885845 10.2486 0.767397 9.96647 0.764696 9.6715C0.761994 9.37653 0.875256 9.09229 1.08009 8.88002L8.28009 1.68002Z"
              fill="currentColor"
            />
            <path
              d="M11.2801 4.67989C11.3845 4.57548 11.5084 4.49267 11.6448 4.43617C11.7812 4.37967 11.9274 4.35059 12.0751 4.35059C12.2227 4.35059 12.3689 4.37967 12.5053 4.43617C12.6417 4.49267 12.7657 4.57548 12.8701 4.67989C12.9745 4.78429 13.0573 4.90823 13.1138 5.04463C13.1703 5.18104 13.1994 5.32724 13.1994 5.47489C13.1994 5.62253 13.1703 5.76873 13.1138 5.90514C13.0573 6.04154 12.9745 6.16548 12.8701 6.26989L8.59657 10.5449C8.03192 11.1336 7.72042 11.9201 7.72886 12.7358C7.7373 13.5515 8.065 14.3314 8.6417 14.9083C9.21841 15.4852 9.9982 15.8131 10.8139 15.8219C11.6296 15.8306 12.4162 15.5193 13.0051 14.9549L17.2801 10.6799C17.3845 10.5755 17.5084 10.4927 17.6448 10.4362C17.7812 10.3797 17.9274 10.3506 18.0751 10.3506C18.2227 10.3506 18.3689 10.3797 18.5053 10.4362C18.6417 10.4927 18.7657 10.5755 18.8701 10.6799C18.9745 10.7843 19.0573 10.9082 19.1138 11.0446C19.1703 11.181 19.1994 11.3272 19.1994 11.4749C19.1994 11.6225 19.1703 11.7687 19.1138 11.9051C19.0573 12.0415 18.9745 12.1655 18.8701 12.2699L14.5966 16.5449C13.5901 17.5516 12.2249 18.1172 10.8014 18.1174C9.37781 18.1175 8.01252 17.5521 7.00582 16.5456C5.99912 15.5391 5.43349 14.174 5.43335 12.7504C5.43321 11.3269 5.99857 9.96158 7.00507 8.95489L11.2801 4.67989Z"
              fill="currentColor"
            />
          </g>
          <defs>
            <clipPath id="mcp-sidebar-icon-clip">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
    },
    { key: "settings", label: t("navigation.preferences"), icon: Settings },
  ];

  const contextTabs: ContextTabItem[] = [
    { key: "providers", label: t("navigation.providers") },
    { key: "prompts", label: "提示词", hidden: activeApp === "openclaw" },
    { key: "sessions", label: "会话", hidden: !hasSessionSupport },
    { key: "workspace", label: t("workspace.title"), hidden: activeApp !== "openclaw" },
    { key: "openclawEnv", label: t("openclaw.env.title"), hidden: activeApp !== "openclaw" },
    { key: "openclawTools", label: t("openclaw.tools.title"), hidden: activeApp !== "openclaw" },
    { key: "openclawAgents", label: t("openclaw.agents.title"), hidden: activeApp !== "openclaw" },
  ];

  const isGlobalView =
    currentView === "skills" ||
    currentView === "skillsDiscovery" ||
    currentView === "mcp" ||
    currentView === "settings";

  const renderContent = () => {
    const content = (() => {
      switch (currentView) {
        case "settings":
          return (
            <SettingsPage
              open={true}
              onOpenChange={() => setCurrentView("providers")}
              onImportSuccess={handleImportSuccess}
              defaultTab={settingsDefaultTab}
            />
          );
        case "prompts":
          return (
            <PromptPanel
              ref={promptPanelRef}
              open={true}
              onOpenChange={() => setCurrentView("providers")}
              appId={activeApp}
            />
          );
        case "skills":
          return (
            <UnifiedSkillsPanel
              ref={unifiedSkillsPanelRef}
              onOpenDiscovery={() => setCurrentView("skillsDiscovery")}
              currentApp={activeApp === "openclaw" ? "claude" : activeApp}
            />
          );
        case "skillsDiscovery":
          return (
            <SkillsPage
              ref={skillsPageRef}
              initialApp={activeApp === "openclaw" ? "claude" : activeApp}
            />
          );
        case "mcp":
          return (
            <UnifiedMcpPanel
              ref={mcpPanelRef}
              onOpenChange={() => setCurrentView("providers")}
            />
          );
        case "agents":
          return (
            <AgentsPanel onOpenChange={() => setCurrentView("providers")} />
          );
        case "universal":
          return (
            <div className="px-6 pt-4">
              <UniversalProviderPanel />
            </div>
          );

        case "sessions":
          return <SessionManagerPage key={activeApp} appId={activeApp} />;
        case "workspace":
          return <WorkspaceFilesPanel />;
        case "openclawEnv":
          return <EnvPanel />;
        case "openclawTools":
          return <ToolsPanel />;
        case "openclawAgents":
          return <AgentsDefaultsPanel />;
        default:
          return (
            <div className="flex h-full flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeApp}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4 p-6"
                >
                    <ProviderList
                      providers={providers}
                      currentProviderId={currentProviderId}
                      appId={activeApp}
                      isLoading={isLoading}
                      isProxyRunning={isProxyRunning}
                      isProxyTakeover={
                        isProxyRunning && isCurrentAppTakeoverActive
                      }
                      activeProviderId={activeProviderId}
                      onSwitch={switchProvider}
                      onEdit={(provider) => {
                        setEditingProvider(provider);
                      }}
                      onDelete={(provider) =>
                        setConfirmAction({ provider, action: "delete" })
                      }
                      onRemoveFromConfig={
                        activeApp === "opencode" || activeApp === "openclaw"
                          ? (provider) =>
                              setConfirmAction({ provider, action: "remove" })
                          : undefined
                      }
                      onDisableOmo={
                        activeApp === "opencode" ? handleDisableOmo : undefined
                      }
                      onDisableOmoSlim={
                        activeApp === "opencode"
                          ? handleDisableOmoSlim
                          : undefined
                      }
                      onDuplicate={handleDuplicateProvider}
                      onConfigureUsage={setUsageProvider}
                      onOpenWebsite={handleOpenWebsite}
                      onOpenTerminal={
                        activeApp === "claude" ? handleOpenTerminal : undefined
                      }
                      onCreate={() => setIsAddOpen(true)}
                      onSetAsDefault={
                        activeApp === "openclaw" ? setAsDefaultModel : undefined
                      }
                    />
                </motion.div>
              </AnimatePresence>
            </div>
          );
      }
    })();

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          className="flex h-full flex-1 min-h-0 flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div
      className="app-shell flex flex-col h-screen overflow-hidden text-foreground selection:bg-primary/30"
      style={{ overflowX: "hidden", paddingTop: DRAG_BAR_HEIGHT }}
    >
      <div
        className="fixed top-0 left-0 right-0 z-[70]"
        data-tauri-drag-region
        style={{ WebkitAppRegion: "drag", height: DRAG_BAR_HEIGHT } as any}
      />
      {showEnvBanner && envConflicts.length > 0 && (
        <EnvWarningBanner
          conflicts={envConflicts}
          onDismiss={() => {
            setShowEnvBanner(false);
            sessionStorage.setItem("env_banner_dismissed", "true");
          }}
          onDeleted={async () => {
            try {
              const allConflicts = await checkAllEnvConflicts();
              const flatConflicts = Object.values(allConflicts).flat();
              setEnvConflicts(flatConflicts);
              if (flatConflicts.length === 0) {
                setShowEnvBanner(false);
              }
            } catch (error) {
              console.error(
                "[App] Failed to re-check conflicts after deletion:",
                error,
              );
            }
          }}
        />
      )}

      <div className="flex flex-1 min-h-0">
        <aside className="app-sidebar flex w-[272px] min-w-[272px] flex-col px-4 pb-4 pt-0">
          <div
            className="flex items-center justify-between px-2 pt-[12px]"
            data-tauri-drag-region
            style={{ WebkitAppRegion: "drag", height: HEADER_HEIGHT } as any}
          >
            <a
              href="https://github.com/farion1231/cc-switch"
              target="_blank"
              rel="noreferrer"
              className={cn(
                "transition-colors",
                isProxyRunning && isCurrentAppTakeoverActive
                  ? "text-emerald-400 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
                  : "text-foreground/70 hover:text-foreground/85",
              )}
              aria-label="CC Switch"
              style={{ WebkitAppRegion: "no-drag" } as any}
            >
              <svg
                width="146"
                height="16"
                viewBox="0 0 292 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-auto"
                aria-hidden="true"
              >
                <path d="M56.363 6.18353V10.7949C56.363 13.939 56.2582 16.6289 56.0836 18.8298L57.8652 18.3756C58.2844 19.7031 58.8084 21.6245 59.4372 24.1048C60.0661 26.5852 60.5202 28.5066 60.7648 29.869L57.3063 31.0218L56.9569 29.3101C55.0705 29.7642 53.5683 30.1834 52.4853 30.5328C51.8914 30.7074 51.4024 30.8821 50.9831 31.0568L49.5508 26.6201C50.7735 26.166 51.053 25.7468 51.4373 24.4542C51.8565 23.0219 52.136 21.5197 52.3106 19.9826C52.4853 18.4455 52.5552 16.0699 52.5552 12.8909V6.63768L50.8783 6.77742V14.6027C50.8783 21.4848 49.6906 27.2839 47.2801 32L43.9613 29.7293C43.2627 30.952 42.1448 31.3362 39.909 31.5808L37.1841 31.8603L35.8216 27.3188L38.4767 27.0743C40.398 26.7598 40.6076 26.7249 40.7125 22.3232C40.7125 21.5896 40.6775 20.6114 40.6426 19.3538C39.35 21.0306 37.9526 22.2533 35.8566 23.8254L34.1099 19.3538C36.171 17.8516 38.4068 15.7905 39.9439 13.7992L39.3849 11.7381C38.5116 12.4717 37.4985 13.2403 36.4155 14.0088L34.8784 9.39749C35.8216 8.73374 36.7649 8.03505 37.6382 7.23156C36.9745 5.79925 36.1361 4.26214 35.1928 2.6901L38.6164 0.733775C39.5596 2.16608 40.2583 3.31892 40.7823 4.22721C41.7954 3.14424 42.7037 1.99141 43.5771 0.768711L46.7212 3.70319C45.5683 5.34511 44.2408 6.95209 42.8085 8.52413C43.5421 10.5154 44.0661 12.7163 44.3456 15.0918C44.66 17.4324 44.7998 20.3669 44.7998 23.8952C44.7998 24.9782 44.7648 25.9214 44.695 26.7249C45.5683 25.0131 46.1273 23.2664 46.3718 21.5546C46.6513 19.8429 46.791 17.4324 46.791 14.3931V2.65516C49.3063 2.48049 52.101 2.20102 55.1403 1.81674C58.2145 1.43246 60.8696 0.978317 63.1054 0.52417L64.2582 4.85603C63.6643 4.99576 62.8957 5.1355 61.9875 5.31017C62.1621 15.1966 63.9438 22.4629 67.1577 28.7511L63.2102 31.7555C61.5682 28.0175 60.3106 24.1048 59.4722 19.9826C58.6338 15.8603 58.1447 11.1791 58.0399 5.97393L56.363 6.18353ZM55.4198 21.345C55.1753 22.952 54.8609 24.3144 54.4766 25.4323C55.1403 25.2577 55.7342 25.1179 56.2932 24.9433C56.0486 23.7555 55.7342 22.5677 55.4198 21.345Z" fill="currentColor"/>
                <path d="M25.7466 10.7947V7.86022H6.35805V10.7947H1.81658V4.92574H12.9257V0L17.4672 0.174671V1.3275H28.5413V3.98251H17.4672V5.06548H30.2881V10.7947H25.7466ZM9.43227 11.5283L10.4454 13.2052C8.45411 14.4279 5.51962 15.7903 3.00435 16.7335L1.53711 13.7641C3.38863 13.2052 5.93884 12.1571 7.86022 11.2139V8.90825H24.2095V11.0742L28.5763 12.8908L30.3929 13.6244L28.9256 16.7335C26.3055 15.4759 23.8951 14.3231 21.6593 13.31L22.5676 11.5283H9.43227ZM32.2444 18.7597L30.2881 22.9518C29.4846 22.6724 28.5064 22.2881 27.3186 21.7641V31.2313H4.82094V21.6593C4.01745 22.0086 3.00435 22.3929 1.78165 22.847L0 18.6899C5.62443 17.0479 10.131 14.9868 13.5895 12.4716H18.5152C21.8689 14.9519 26.8296 17.2226 32.2444 18.7597ZM13.2401 17.3973H18.8995C17.8165 16.7335 16.9082 16.0698 16.1047 15.406C15.406 15.965 14.4628 16.6287 13.2401 17.3973ZM9.43227 20.0523V21.275H22.6025V20.0523H9.43227ZM22.6025 24.8383V23.6855H9.43227V24.8383H22.6025ZM22.6025 27.3186H9.43227V28.4016H22.6025V27.3186Z" fill="currentColor"/>
                <path d="M78.8027 0H82.8202V31.9998H78.8027V0Z" fill="currentColor"/>
                <path d="M269.108 3.77307H274.628V13.9739H285.702V3.77307H291.221V28.2271H285.702V18.5852H274.628V28.2271H269.108V3.77307Z" fill="currentColor"/>
                <path d="M262.564 11.5635C260.888 9.64215 258.477 8.38451 256.206 8.38451C252.014 8.38451 248.765 11.6334 248.765 15.8954C248.765 20.1574 252.014 23.4412 256.206 23.4412C258.407 23.4412 260.818 22.3233 262.564 20.5766L265.813 24.105C263.228 26.76 259.49 28.4718 255.927 28.4718C248.626 28.4718 243.106 23.0569 243.106 15.9653C243.106 8.90853 248.73 3.59851 256.136 3.59851C259.665 3.59851 263.368 5.17056 265.778 7.65089L262.564 11.5635Z" fill="currentColor"/>
                <path d="M222.792 3.77307H243.229V8.45427H235.753V28.2271H230.233V8.45427H222.792V3.77307Z" fill="currentColor"/>
                <path d="M214.25 3.77307H219.77V28.2271H214.25V3.77307Z" fill="currentColor"/>
                <path d="M174.307 3.77307H180.245L185.381 22.2184L190.481 3.77307H195.896L201.066 22.2184L206.167 3.77307H211.826L203.721 28.2271H198.027L193.101 10.7949L188.071 28.2271H182.376L174.307 3.77307Z" fill="currentColor"/>
                <path d="M170.859 10.76C168.274 9.22286 165.199 8.2447 163.243 8.2447C161.391 8.2447 160.134 8.90845 160.134 10.236C160.134 14.7425 173.164 12.2272 173.129 21.0307C173.129 25.8167 168.972 28.4018 163.557 28.4018C159.54 28.4018 155.523 26.8647 152.763 24.5241L154.964 20.0176C157.479 22.2534 161.042 23.6857 163.627 23.6857C165.898 23.6857 167.26 22.8472 167.26 21.3451C167.26 16.7337 154.23 19.4237 154.23 10.76C154.23 6.32331 158.038 3.52856 163.697 3.52856C167.121 3.52856 170.544 4.57659 172.99 6.18357L170.859 10.76Z" fill="currentColor"/>
                <path d="M137.736 11.5635C136.059 9.64215 133.648 8.38451 131.378 8.38451C127.186 8.38451 123.937 11.6334 123.937 15.8954C123.937 20.1574 127.186 23.4412 131.378 23.4412C133.579 23.4412 135.989 22.3233 137.736 20.5766L140.985 24.105C138.4 26.76 134.662 28.4718 131.098 28.4718C123.797 28.4718 118.277 23.0569 118.277 15.9653C118.277 8.90853 123.902 3.59851 131.308 3.59851C134.836 3.59851 138.539 5.17056 140.95 7.65089L137.736 11.5635Z" fill="currentColor"/>
                <path d="M113.923 11.5635C112.246 9.64215 109.836 8.38451 107.565 8.38451C103.373 8.38451 100.124 11.6334 100.124 15.8954C100.124 20.1574 103.373 23.4412 107.565 23.4412C109.766 23.4412 112.177 22.3233 113.923 20.5766L117.172 24.105C114.587 26.76 110.849 28.4718 107.286 28.4718C99.9845 28.4718 94.4648 23.0569 94.4648 15.9653C94.4648 8.90853 100.089 3.59851 107.495 3.59851C111.024 3.59851 114.727 5.17056 117.137 7.65089L113.923 11.5635Z" fill="currentColor"/>
              </svg>
            </a>
            <div
              className="flex items-center gap-1"
              style={{ WebkitAppRegion: "no-drag" } as any}
            >
              <UpdateBadge
                onClick={() => {
                  setSettingsDefaultTab("about");
                  setCurrentView("settings");
                }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-2 pt-4 space-y-6">
            <div className="space-y-2">
              <div className="app-sidebar-section-label px-1">{t("navigation.agents")}</div>
              <AppSwitcher
                activeApp={activeApp}
                isHighlighted={!isGlobalView}
                onSwitch={(app) => {
                  setActiveApp(app);
                  setCurrentView("providers");
                }}
                visibleApps={visibleApps}
                orientation="vertical"
              />
            </div>

            <div className="space-y-2">
              <div className="app-sidebar-section-label px-1">{t("navigation.globalConfig")}</div>
              <div className="space-y-1">
                {globalSidebarItems
                  .filter((item) => !item.hidden)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.key === "skills"
                        ? currentView === "skills" || currentView === "skillsDiscovery"
                        : currentView === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setCurrentView(item.key)}
                        className="app-nav-item"
                        data-active={isActive}
                      >
                        {item.iconNode ?? (Icon ? <Icon className="h-4 w-4" /> : null)}
                        <span className="truncate text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

          </div>
        </aside>

        <section className="flex min-w-0 flex-1 pt-0 pr-[28px] pb-0 pl-0">
          <div className="app-content-shell flex min-w-0 flex-1 flex-col overflow-hidden">
            <header
              className="app-page-header z-40"
              data-tauri-drag-region
              style={{ WebkitAppRegion: "drag", minHeight: HEADER_HEIGHT } as any}
            >
              <div className="flex flex-col px-6 pt-5 pb-0">
              <div className="flex min-h-[40px] flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                <div
                  className="flex min-w-0 items-center gap-3"
                  style={{ WebkitAppRegion: "no-drag" } as any}
                >
                  <div className="min-w-0">
                    <h1 className="truncate text-lg font-semibold tracking-tight">
                      {currentView === "skills" || currentView === "skillsDiscovery"
                        ? t("navigation.skills")
                        : currentView === "mcp"
                          ? t("navigation.mcp")
                          : currentView === "settings"
                            ? t("navigation.preferences")
                            : activeApp === "claude"
                              ? t("navigation.claudeCode")
                              : activeApp === "gemini"
                                ? t("navigation.geminiCli")
                                : t(`apps.${activeApp}`)}
                    </h1>
                  </div>
                </div>

                <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 md:flex-nowrap">
                  {currentView === "providers" &&
                    activeApp !== "opencode" &&
                    activeApp !== "openclaw" && (
                      <div
                        className="flex shrink-0 items-center gap-1.5"
                        style={{ WebkitAppRegion: "no-drag" } as any}
                      >
                        {settingsData?.enableLocalProxy && (
                          <ProxyToggle activeApp={activeApp} />
                        )}
                        {settingsData?.enableFailoverToggle && (
                          <FailoverToggle activeApp={activeApp} />
                        )}
                      </div>
                    )}
                  {isCurrentAppTakeoverActive && currentView === "providers" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSettingsDefaultTab("usage");
                        setCurrentView("settings");
                      }}
                      title={t("usage.title", {
                        defaultValue: "使用统计",
                      })}
                      style={{ WebkitAppRegion: "no-drag" } as any}
                    >
                      <BarChart2 className="w-4 h-4" />
                    </Button>
                  )}
                  <div
                    ref={toolbarRef}
                    className="flex min-w-0 items-center justify-end gap-2 overflow-x-auto md:flex-nowrap"
                    style={{ WebkitAppRegion: "no-drag" } as any}
                  >
                    {currentView === "prompts" && promptCount > 0 && (
                      <Button variant="outline" size="sm" onClick={() => promptPanelRef.current?.openAdd()}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t("prompts.add")}
                      </Button>
                    )}
                    {currentView === "mcp" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => mcpPanelRef.current?.openImport()}>
                          <Download className="w-4 h-4 mr-2" />
                          {t("mcp.importExisting")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => mcpPanelRef.current?.openAdd()}>
                          <Plus className="w-4 h-4 mr-2" />
                          {t("mcp.addMcp")}
                        </Button>
                      </>
                    )}
                    {currentView === "skills" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => unifiedSkillsPanelRef.current?.openRestoreFromBackup()}>
                          <History className="w-4 h-4 mr-2" />
                          {t("skills.restoreFromBackup.button")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => unifiedSkillsPanelRef.current?.openInstallFromZip()}>
                          <FolderArchive className="w-4 h-4 mr-2" />
                          {t("skills.installFromZip.button")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => unifiedSkillsPanelRef.current?.openImport()}>
                          <Download className="w-4 h-4 mr-2" />
                          {t("skills.import")}
                        </Button>
                        <Button variant="default" size="sm" onClick={() => setCurrentView("skillsDiscovery")}>
                          <Search className="w-4 h-4 mr-2" />
                          {t("skills.discover")}
                        </Button>
                      </>
                    )}
                    {currentView === "skillsDiscovery" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => skillsPageRef.current?.refresh()}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          {t("skills.refresh")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => skillsPageRef.current?.openRepoManager()}>
                          <Settings className="w-4 h-4 mr-2" />
                          {t("skills.repoManager")}
                        </Button>
                      </>
                    )}
                    {currentView === "providers" && providerCount > 0 && (
                      <Button
                        onClick={() => setIsAddOpen(true)}
                        size="icon"
                        className={addActionButtonClass}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {(currentView === "providers" ||
                currentView === "prompts" ||
                currentView === "sessions" ||
                currentView === "workspace" ||
                currentView === "openclawEnv" ||
                currentView === "openclawTools" ||
                currentView === "openclawAgents") && (
                <div
                  className="mt-2 flex items-center border-b border-border/70 pt-1"
                  style={{ WebkitAppRegion: "no-drag" } as any}
                >
                  <div className="flex items-center gap-6 text-sm">
                    {contextTabs
                      .filter((item) => !item.hidden)
                      .map((item) => {
                        const isActive = currentView === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setCurrentView(item.key)}
                            className={cn(
                              "relative inline-flex items-center pb-3 text-sm font-medium transition-colors",
                              isActive
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <span>{item.label}</span>
                            {item.key === "providers" && providerCount > 0 && (
                              <span className="ml-[6px] inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-[6px] text-[12px] font-semibold leading-none text-background">
                                {providerCount}
                              </span>
                            )}
                            {item.key === "prompts" && promptCount > 0 && (
                              <span className="ml-[6px] inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-[6px] text-[12px] font-semibold leading-none text-background">
                                {promptCount}
                              </span>
                            )}
                            {isActive && (
                              <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-foreground/80" />
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
            </header>

            <main className="flex-1 h-full min-h-0 flex flex-col overflow-hidden animate-fade-in">
              {isOpenClawView && openclawHealthWarnings.length > 0 && (
                <OpenClawHealthBanner warnings={openclawHealthWarnings} />
              )}
              {renderContent()}
            </main>
          </div>
        </section>
      </div>

      <AddProviderDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        appId={activeApp}
        onSubmit={addProvider}
      />

      <EditProviderDialog
        open={Boolean(editingProvider)}
        provider={effectiveEditingProvider}
        onOpenChange={(open) => {
          if (!open) {
            setEditingProvider(null);
          }
        }}
        onSubmit={handleEditProvider}
        appId={activeApp}
        isProxyTakeover={isProxyRunning && isCurrentAppTakeoverActive}
      />

      {effectiveUsageProvider && (
        <UsageScriptModal
          key={effectiveUsageProvider.id}
          provider={effectiveUsageProvider}
          appId={activeApp}
          isOpen={Boolean(usageProvider)}
          onClose={() => setUsageProvider(null)}
          onSave={(script) => {
            if (usageProvider) {
              void saveUsageScript(usageProvider, script);
            }
          }}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        title={
          confirmAction?.action === "remove"
            ? t("confirm.removeProvider")
            : t("confirm.deleteProvider")
        }
        message={
          confirmAction
            ? confirmAction.action === "remove"
              ? t("confirm.removeProviderMessage", {
                  name: confirmAction.provider.name,
                })
              : t("confirm.deleteProviderMessage", {
                  name: confirmAction.provider.name,
                })
            : ""
        }
        onConfirm={() => void handleConfirmAction()}
        onCancel={() => setConfirmAction(null)}
      />

      <DeepLinkImportDialog />
    </div>
  );
}

export default App;
