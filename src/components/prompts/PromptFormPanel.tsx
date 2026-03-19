import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MarkdownEditor from "@/components/MarkdownEditor";
import type { Prompt, AppId } from "@/lib/api";

interface PromptFormPanelProps {
  appId: AppId;
  editingId?: string;
  initialData?: Prompt;
  onSave: (id: string, prompt: Prompt) => Promise<void>;
  onClose: () => void;
}

const PromptFormPanel: React.FC<PromptFormPanelProps> = ({
  appId,
  editingId,
  initialData,
  onSave,
  onClose,
}) => {
  const { t } = useTranslation();
  const appName = t(`apps.${appId}`);
  const filenameMap: Record<AppId, string> = {
    claude: "CLAUDE.md",
    codex: "AGENTS.md",
    gemini: "GEMINI.md",
    opencode: "AGENTS.md",
    openclaw: "AGENTS.md",
  };
  const filename = filenameMap[appId];
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setContent(initialData.content);
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    setSaving(true);
    try {
      const id = editingId || `prompt-${Date.now()}`;
      const timestamp = Math.floor(Date.now() / 1000);
      const prompt: Prompt = {
        id,
        name: name.trim(),
        description: description.trim() || undefined,
        content: content.trim(),
        enabled: initialData?.enabled || false,
        createdAt: initialData?.createdAt || timestamp,
        updatedAt: timestamp,
      };
      await onSave(id, prompt);
      onClose();
    } catch (error) {
      // Error handled by hook
    } finally {
      setSaving(false);
    }
  };

  const title = editingId
    ? t("prompts.editTitle", { appName })
    : t("prompts.addTitle", { appName });

  return (
    <Dialog open onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent variant="form" zIndex="alert" className="max-w-[960px]">
        <DialogHeader className="gap-4 pb-2">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="pt-1 text-lg font-semibold">
              {title}
            </DialogTitle>
            <DialogCloseButton onClick={onClose} />
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="glass space-y-6 rounded-xl border border-white/10 p-6">
            <div>
              <Label htmlFor="name" className="text-foreground">
                {t("prompts.name")}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("prompts.namePlaceholder")}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-foreground">
                {t("prompts.description")}
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("prompts.descriptionPlaceholder")}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="content" className="mb-2 block text-foreground">
                {t("prompts.content")}
              </Label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder={t("prompts.contentPlaceholder", { filename })}
                darkMode={isDarkMode}
                minHeight="167px"
              />
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromptFormPanel;
