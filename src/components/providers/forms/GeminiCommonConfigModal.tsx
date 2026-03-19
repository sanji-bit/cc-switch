import React, { useEffect, useState } from "react";
import { Save, Download, Loader2 } from "lucide-react";
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
import JsonEditor from "@/components/JsonEditor";

interface GeminiCommonConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onSave: (value: string) => boolean;
  error?: string;
  onExtract?: () => void;
  isExtracting?: boolean;
}

/**
 * GeminiCommonConfigModal - Common Gemini configuration editor modal
 * Allows editing of common env snippet shared across Gemini providers
 */
export const GeminiCommonConfigModal: React.FC<
  GeminiCommonConfigModalProps
> = ({ isOpen, onClose, value, onSave, error, onExtract, isExtracting }) => {
  const { t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [draftValue, setDraftValue] = useState(value);

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
    if (isOpen) {
      setDraftValue(value);
    }
  }, [isOpen, value]);

  const handleClose = () => {
    setDraftValue(value);
    onClose();
  };

  const handleSave = () => {
    if (onSave(draftValue)) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent variant="form" zIndex="alert" className="max-w-[960px]">
        <DialogHeader className="gap-4 pb-2">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="pt-1 text-lg font-semibold">
              {t("geminiConfig.editCommonConfigTitle", {
                defaultValue: "编辑 Gemini 通用配置片段",
              })}
            </DialogTitle>
            <DialogCloseButton onClick={handleClose} />
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("geminiConfig.commonConfigHint", {
                defaultValue:
                  "该片段会写入 Gemini 的 .env（不允许包含 GOOGLE_GEMINI_BASE_URL、GEMINI_API_KEY）",
              })}
            </p>

            <JsonEditor
              value={draftValue}
              onChange={setDraftValue}
              placeholder={`{
  "GEMINI_MODEL": "gemini-3-pro-preview"
}`}
              darkMode={isDarkMode}
              rows={16}
              showValidation={true}
              language="json"
            />

            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          {onExtract && (
            <Button
              type="button"
              variant="outline"
              onClick={onExtract}
              disabled={isExtracting}
              className="gap-2"
            >
              {isExtracting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {t("geminiConfig.extractFromCurrent", {
                defaultValue: "从编辑内容提取",
              })}
            </Button>
          )}
          <Button type="button" variant="outline" onClick={handleClose}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
