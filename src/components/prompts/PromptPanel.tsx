import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type AppId } from "@/lib/api";
import { usePromptActions } from "@/hooks/usePromptActions";
import PromptListItem from "./PromptListItem";
import PromptFormModal from "./PromptFormModal";
import { ConfirmDialog } from "../ConfirmDialog";

interface PromptPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: AppId;
}

export interface PromptPanelHandle {
  openAdd: () => void;
  getPromptCount: () => number;
}

const PromptPanel = React.forwardRef<PromptPanelHandle, PromptPanelProps>(
  ({ open, appId }, ref) => {
    const { t } = useTranslation();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
      isOpen: boolean;
      titleKey: string;
      messageKey: string;
      messageParams?: Record<string, unknown>;
      onConfirm: () => void;
    } | null>(null);

    const {
      prompts,
      loading,
      reload,
      savePrompt,
      deletePrompt,
      toggleEnabled,
    } = usePromptActions(appId);

    useEffect(() => {
      if (open) reload();
    }, [open, reload]);

    // Listen for prompt import events from deep link
    useEffect(() => {
      const handlePromptImported = (event: Event) => {
        const customEvent = event as CustomEvent;
        // Reload if the import is for this app
        if (customEvent.detail?.app === appId) {
          reload();
        }
      };

      window.addEventListener("prompt-imported", handlePromptImported);
      return () => {
        window.removeEventListener("prompt-imported", handlePromptImported);
      };
    }, [appId, reload]);

    const handleAdd = () => {
      setEditingId(null);
      setIsFormOpen(true);
    };

    const handleEdit = (id: string) => {
      setEditingId(id);
      setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
      const prompt = prompts[id];
      setConfirmDialog({
        isOpen: true,
        titleKey: "prompts.confirm.deleteTitle",
        messageKey: "prompts.confirm.deleteMessage",
        messageParams: { name: prompt?.name },
        onConfirm: async () => {
          try {
            await deletePrompt(id);
            setConfirmDialog(null);
          } catch (e) {
            // Error handled by hook
          }
        },
      });
    };

    const promptEntries = useMemo(() => Object.entries(prompts), [prompts]);

    React.useImperativeHandle(
      ref,
      () => ({
        openAdd: handleAdd,
        getPromptCount: () => promptEntries.length,
      }),
      [handleAdd, promptEntries.length],
    );

    return (
      <div className="flex flex-col flex-1 min-h-0 p-6">
        <div className="flex-1 overflow-y-auto pb-16">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("prompts.loading")}
            </div>
          ) : promptEntries.length === 0 ? (
            <div className="flex min-h-[calc(100vh-18rem)] w-full items-center justify-center px-6 py-10">
              <div className="flex w-full max-w-[480px] flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-[80px] w-[80px] items-center justify-center" aria-hidden="true">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-[80px] w-[80px]"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M13.333 16.6667V63.3333C13.333 68.8562 17.8102 73.3333 23.333 73.3333H56.6663C62.1892 73.3333 66.6663 68.8562 66.6663 63.3333V30C66.6663 24.4772 62.1892 20 56.6663 20H16.6663C14.8254 20 13.333 18.5076 13.333 16.6667ZM24.1663 40C24.1663 38.6193 25.2856 37.5 26.6663 37.5H53.333C54.7137 37.5 55.833 38.6193 55.833 40C55.833 41.3807 54.7137 42.5 53.333 42.5H26.6663C25.2856 42.5 24.1663 41.3807 24.1663 40ZM24.1663 51.6667C24.1663 50.286 25.2856 49.1667 26.6663 49.1667H44.9997C46.3804 49.1667 47.4997 50.286 47.4997 51.6667C47.4997 53.0474 46.3804 54.1667 44.9997 54.1667H26.6663C25.2856 54.1667 24.1663 53.0474 24.1663 51.6667Z"
                      fill="black"
                      fillOpacity="0.12"
                    />
                    <path
                      d="M14.6956 13.6237C15.8572 14.1446 16.6663 15.3112 16.6663 16.6667H56.6663C57.8173 16.6667 58.9343 16.8125 59.9997 17.0867V14.3535C59.9997 10.2965 56.4064 7.18006 52.3902 7.7538L16.3983 12.8955C15.7567 12.9872 15.1754 13.2458 14.6956 13.6237Z"
                      fill="black"
                      fillOpacity="0.12"
                    />
                  </svg>
                </div>
                <h3 className="text-center text-base font-semibold leading-tight tracking-tight text-foreground">
                  {t("prompts.empty")}
                </h3>
                <p className="mt-4 max-w-[480px] text-center text-sm leading-5 text-muted-foreground">
                  {t("prompts.emptyDescription")}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("prompts.add")}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-4">
              {promptEntries.map(([id, prompt]) => (
                <PromptListItem
                  key={id}
                  id={id}
                  prompt={prompt}
                  onToggle={toggleEnabled}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {isFormOpen && (
          <PromptFormModal
            appId={appId}
            editingId={editingId || undefined}
            initialData={editingId ? prompts[editingId] : undefined}
            onSave={savePrompt}
            onClose={() => setIsFormOpen(false)}
          />
        )}

        {confirmDialog && (
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={t(confirmDialog.titleKey)}
            message={t(confirmDialog.messageKey, confirmDialog.messageParams)}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(null)}
          />
        )}
      </div>
    );
  },
);

PromptPanel.displayName = "PromptPanel";

export default PromptPanel;
