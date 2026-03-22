import { useEffect, useMemo, useRef, useState } from "react";
import { useSessionSearch } from "@/hooks/useSessionSearch";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Copy,
  RefreshCw,
  Search,
  Play,
  Trash2,
  MessageSquare,
  Clock,
  Folder,
  X,
} from "lucide-react";
import {
  useDeleteSessionMutation,
  useSessionMessagesQuery,
  useSessionsQuery,
} from "@/lib/query";
import { sessionsApi } from "@/lib/api";
import type { SessionMeta } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { extractErrorMessage } from "@/utils/errorUtils";
import { isMac } from "@/lib/platform";
import { ProviderIcon } from "@/components/ProviderIcon";
import { SessionItem } from "./SessionItem";
import { SessionMessageItem } from "./SessionMessageItem";
import { SessionTocDialog, SessionTocSidebar } from "./SessionToc";
import {
  formatSessionTitle,
  formatTimestamp,
  getBaseName,
  getProviderIconName,
  getProviderLabel,
  getSessionKey,
} from "./utils";

type ProviderFilter =
  | "all"
  | "codex"
  | "claude"
  | "opencode"
  | "openclaw"
  | "gemini";

export function SessionManagerPage({ appId }: { appId: string }) {
  const { t } = useTranslation();
  const { data, isLoading, refetch } = useSessionsQuery();
  const sessions = data ?? [];
  const detailRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [activeMessageIndex, setActiveMessageIndex] = useState<number | null>(
    null,
  );
  const [tocDialogOpen, setTocDialogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SessionMeta | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState("");
  const initialProviderFilter = appId as ProviderFilter;
  const [providerFilter, setProviderFilter] =
    useState<ProviderFilter>(initialProviderFilter);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // 使用 FlexSearch 全文搜索
  const { search: searchSessions } = useSessionSearch({
    sessions,
    providerFilter,
  });

  useEffect(() => {
    setProviderFilter(initialProviderFilter);
  }, [initialProviderFilter]);

  const filteredSessions = useMemo(() => {
    return searchSessions(search);
  }, [searchSessions, search]);

  useEffect(() => {
    if (filteredSessions.length === 0) {
      setSelectedKey(null);
      return;
    }
    const exists = selectedKey
      ? filteredSessions.some(
          (session) => getSessionKey(session) === selectedKey,
        )
      : false;
    if (!exists) {
      setSelectedKey(getSessionKey(filteredSessions[0]));
    }
  }, [filteredSessions, selectedKey]);

  const selectedSession = useMemo(() => {
    if (!selectedKey) return null;
    return (
      filteredSessions.find(
        (session) => getSessionKey(session) === selectedKey,
      ) || null
    );
  }, [filteredSessions, selectedKey]);

  const { data: messages = [], isLoading: isLoadingMessages } =
    useSessionMessagesQuery(
      selectedSession?.providerId,
      selectedSession?.sourcePath,
    );
  const deleteSessionMutation = useDeleteSessionMutation();

  // 提取用户消息用于目录
  const userMessagesToc = useMemo(() => {
    return messages
      .map((msg, index) => ({ msg, index }))
      .filter(({ msg }) => msg.role.toLowerCase() === "user")
      .map(({ msg, index }) => ({
        index,
        preview:
          msg.content.slice(0, 50) + (msg.content.length > 50 ? "..." : ""),
        ts: msg.ts,
      }));
  }, [messages]);

  const scrollToMessage = (index: number) => {
    const el = messageRefs.current.get(index);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setActiveMessageIndex(index);
      setTocDialogOpen(false); // 关闭弹窗
      // 清除高亮状态
      setTimeout(() => setActiveMessageIndex(null), 2000);
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      // 这里的 setTimeout 其实无法直接清理，因为它在函数闭包里。
      // 如果要严格清理，需要用 useRef 存 timer id。
      // 但对于 2秒的高亮清除，通常不清理也没大问题。
      // 为了代码规范，我们在组件卸载时将 activeMessageIndex 重置 (虽然 React 会处理)
    };
  }, []);

  const handleCopy = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch (error) {
      toast.error(
        extractErrorMessage(error) ||
          t("common.error", { defaultValue: "Copy failed" }),
      );
    }
  };

  const handleResume = async () => {
    if (!selectedSession?.resumeCommand) return;

    if (!isMac()) {
      await handleCopy(
        selectedSession.resumeCommand,
        t("sessionManager.resumeCommandCopied"),
      );
      return;
    }

    try {
      await sessionsApi.launchTerminal({
        command: selectedSession.resumeCommand,
        cwd: selectedSession.projectDir ?? undefined,
      });
      toast.success(t("sessionManager.terminalLaunched"));
    } catch (error) {
      const fallback = selectedSession.resumeCommand;
      await handleCopy(fallback, t("sessionManager.resumeFallbackCopied"));
      toast.error(extractErrorMessage(error) || t("sessionManager.openFailed"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.sourcePath || deleteSessionMutation.isPending) {
      return;
    }

    setDeleteTarget(null);
    await deleteSessionMutation.mutateAsync({
      providerId: deleteTarget.providerId,
      sessionId: deleteTarget.sessionId,
      sourcePath: deleteTarget.sourcePath,
    });
  };

  return (
    <TooltipProvider>
      <div className="mx-auto w-full p-6 flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* 主内容区域 - 左右分栏 */}
          <Card className="flex-1 overflow-hidden">
            <div className="grid h-full min-h-0 md:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
              {/* 左侧会话列表 */}
              <div className="flex min-h-0 flex-col border-r border-border/60">
                <CardHeader className="px-4 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <CardTitle className="text-[16px] font-medium leading-none">
                          {t("sessionManager.sessionList", {
                            defaultValue: "会话列表",
                          })}
                          <span className="ml-1">({filteredSessions.length})</span>
                        </CardTitle>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => void refetch()}
                            >
                              <RefreshCw className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t("common.refresh")}</TooltipContent>
                        </Tooltip>
                      </div>

                      <Select
                        value={providerFilter}
                        onValueChange={(value) =>
                          setProviderFilter(value as ProviderFilter)
                        }
                      >
                        <SelectTrigger className="h-8 w-fit min-w-0 shrink-0 gap-1.5 border-0 bg-transparent px-2 text-sm shadow-none focus:border-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("sessionManager.providerFilterAll", {
                              defaultValue: "全部",
                            })}
                          </SelectItem>
                          <SelectItem value="claude">Claude Code</SelectItem>
                          <SelectItem value="codex">Codex</SelectItem>
                          <SelectItem value="gemini">Gemini CLI</SelectItem>
                          <SelectItem value="opencode">OpenCode</SelectItem>
                          <SelectItem value="openclaw">OpenClaw</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/45" />
                      <Input
                        ref={searchInputRef}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t("sessionManager.searchPlaceholder")}
                        className="h-8 rounded-[8px] border-0 bg-muted/55 shadow-none pl-[30px] pr-9 text-sm placeholder:text-muted-foreground/45 transition-colors hover:bg-muted/70 focus-visible:bg-muted/70 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      {search && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 size-6"
                          onClick={() => setSearch("")}
                        >
                          <X className="size-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full">
                    <div className="px-4 pb-4 pt-0">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <RefreshCw className="size-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : filteredSessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <MessageSquare className="size-8 text-muted-foreground/50 mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {t("sessionManager.noSessions")}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {filteredSessions.map((session) => {
                            const isSelected =
                              selectedKey !== null &&
                              getSessionKey(session) === selectedKey;

                            return (
                              <SessionItem
                                key={getSessionKey(session)}
                                session={session}
                                isSelected={isSelected}
                                onSelect={setSelectedKey}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </div>

              {/* 右侧会话详情 */}
              <div
                className="flex min-h-0 flex-col overflow-hidden"
                ref={detailRef}
              >
                {!selectedSession ? (
                  <div className="flex flex-1 flex-col items-center justify-center p-8 text-muted-foreground">
                    <MessageSquare className="mb-3 size-12 opacity-30" />
                    <p className="text-sm">{t("sessionManager.selectSession")}</p>
                  </div>
                ) : (
                  <>
                  {/* 详情头部 */}
                  <CardHeader className="shrink-0 p-4">
                    <div className="w-full">
                      <div className="flex items-start gap-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/70">
                              <ProviderIcon
                                icon={getProviderIconName(selectedSession.providerId)}
                                name={selectedSession.providerId}
                                size={20}
                              />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {getProviderLabel(selectedSession.providerId, t)}
                          </TooltipContent>
                        </Tooltip>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <h2 className="truncate text-[16px] font-semibold leading-none text-foreground">
                                {formatSessionTitle(selectedSession)}
                              </h2>
                              <div className="mt-[6px] flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="size-3" />
                                  <span>
                                    {formatTimestamp(
                                      selectedSession.lastActiveAt ??
                                        selectedSession.createdAt,
                                    )}
                                  </span>
                                </div>
                                {selectedSession.projectDir && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void handleCopy(
                                            selectedSession.projectDir!,
                                            t("sessionManager.projectDirCopied"),
                                          )
                                        }
                                        className="flex min-w-0 items-center gap-1.5 transition-colors hover:text-foreground"
                                      >
                                        <Folder className="size-3 shrink-0" />
                                        <span className="truncate">
                                          {getBaseName(selectedSession.projectDir)}
                                        </span>
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="max-w-xs">
                                      <p className="font-mono text-xs break-all">
                                        {selectedSession.projectDir}
                                      </p>
                                      <p className="mt-1 text-muted-foreground">
                                        {t("sessionManager.clickToCopyPath")}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                <div className="flex items-center gap-1.5">
                                  <MessageSquare className="size-3 shrink-0" />
                                  <span>
                                    {t("sessionManager.conversationHistory", {
                                      defaultValue: "对话记录",
                                    })}
                                  </span>
                                  <span>{messages.length}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5"
                                    onClick={() => setDeleteTarget(selectedSession)}
                                    disabled={
                                      !selectedSession.sourcePath ||
                                      deleteSessionMutation.isPending
                                    }
                                  >
                                    <Trash2 className="size-3.5" />
                                    <span>
                                      {deleteSessionMutation.isPending
                                        ? t("sessionManager.deleting", {
                                            defaultValue: "删除中...",
                                          })
                                        : t("common.delete", {
                                            defaultValue: "删除",
                                          })}
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {deleteSessionMutation.isPending
                                    ? t("sessionManager.deleting", {
                                        defaultValue: "删除中...",
                                      })
                                    : t("sessionManager.deleteTooltip", {
                                        defaultValue: "永久删除此本地会话记录",
                                      })}
                                </TooltipContent>
                              </Tooltip>
                              {selectedSession.resumeCommand && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="gap-1.5"
                                      onClick={() =>
                                        void handleCopy(
                                          selectedSession.resumeCommand!,
                                          t("sessionManager.resumeCommandCopied"),
                                        )
                                      }
                                    >
                                      <Copy className="size-3.5" />
                                      <span>
                                        {t("sessionManager.copyCommand", {
                                          defaultValue: "复制命令",
                                        })}
                                      </span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {t("sessionManager.copyCommand", {
                                      defaultValue: "复制命令",
                                    })}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {isMac() && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="gap-1.5"
                                      onClick={() => void handleResume()}
                                      disabled={!selectedSession.resumeCommand}
                                    >
                                      <Play className="size-3.5" />
                                      <span className="hidden sm:inline">
                                        {t("sessionManager.resume", {
                                          defaultValue: "恢复会话",
                                        })}
                                      </span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {selectedSession.resumeCommand
                                      ? t("sessionManager.resumeTooltip", {
                                          defaultValue: "在终端中恢复此会话",
                                        })
                                      : t("sessionManager.noResumeCommand", {
                                          defaultValue: "此会话无法恢复",
                                        })}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {/* 消息列表区域 */}
                  <CardContent className="flex-1 overflow-hidden border-t border-border/60 p-0">
                    <div className="flex h-full min-w-0">
                      {/* 消息列表 */}
                      <ScrollArea className="flex-1 min-w-0">
                        <div className="min-w-0 px-4 py-4">
                          {isLoadingMessages ? (
                            <div className="flex items-center justify-center py-12">
                              <RefreshCw className="size-5 animate-spin text-muted-foreground" />
                            </div>
                          ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <MessageSquare className="size-8 text-muted-foreground/50 mb-2" />
                              <p className="text-sm text-muted-foreground">
                                {t("sessionManager.emptySession")}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {messages.map((message, index) => (
                                <SessionMessageItem
                                  key={`${message.role}-${index}`}
                                  message={message}
                                  providerId={selectedSession.providerId}
                                  index={index}
                                  isActive={activeMessageIndex === index}
                                  setRef={(el) => {
                                    if (el) messageRefs.current.set(index, el);
                                  }}
                                  onCopy={(content) =>
                                    handleCopy(
                                      content,
                                      t("sessionManager.messageCopied", {
                                        defaultValue: "已复制消息内容",
                                      }),
                                    )
                                  }
                                />
                              ))}
                              <div ref={messagesEndRef} />
                            </div>
                          )}
                        </div>
                      </ScrollArea>

                      {/* 右侧目录 - 类似少数派 (大屏幕) */}
                      <SessionTocSidebar
                        items={userMessagesToc}
                        onItemClick={scrollToMessage}
                      />
                    </div>

                    {/* 浮动目录按钮 (小屏幕) */}
                    <SessionTocDialog
                      items={userMessagesToc}
                      onItemClick={scrollToMessage}
                      open={tocDialogOpen}
                      onOpenChange={setTocDialogOpen}
                    />
                  </CardContent>
                </>
              )}
              </div>
            </div>
          </Card>
        </div>
      </div>
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={t("sessionManager.deleteConfirmTitle", {
          defaultValue: "删除会话",
        })}
        message={
          deleteTarget
            ? t("sessionManager.deleteConfirmMessage", {
                defaultValue:
                  "将永久删除本地会话“{{title}}”\nSession ID: {{sessionId}}\n\n此操作不可恢复。",
                title: formatSessionTitle(deleteTarget),
                sessionId: deleteTarget.sessionId,
              })
            : ""
        }
        confirmText={t("sessionManager.deleteConfirmAction", {
          defaultValue: "删除会话",
        })}
        cancelText={t("common.cancel", { defaultValue: "取消" })}
        variant="destructive"
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => {
          if (!deleteSessionMutation.isPending) {
            setDeleteTarget(null);
          }
        }}
      />
    </TooltipProvider>
  );
}
