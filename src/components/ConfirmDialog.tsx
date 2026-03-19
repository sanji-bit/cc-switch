import {
  Dialog,
  DialogBody,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "info";
  zIndex?: "base" | "nested" | "alert" | "top";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  variant = "destructive",
  zIndex = "alert",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  const IconComponent = variant === "info" ? Info : AlertTriangle;
  const iconClass =
    variant === "info" ? "h-5 w-5 text-blue-500" : "h-5 w-5 text-destructive";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onCancel();
        }
      }}
    >
      <DialogContent variant="confirm" zIndex={zIndex}>
        <DialogHeader className="gap-4 pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/70">
                <IconComponent className={iconClass} />
              </div>
              <DialogTitle className="pt-1 text-lg font-semibold">
                {title}
              </DialogTitle>
            </div>
            <DialogCloseButton onClick={onCancel} />
          </div>
        </DialogHeader>
        <DialogBody className="py-2">
          <DialogDescription className="whitespace-pre-line text-sm leading-relaxed">
            {message}
          </DialogDescription>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {cancelText || t("common.cancel")}
          </Button>
          <Button
            variant={variant === "info" ? "default" : "destructive"}
            onClick={onConfirm}
          >
            {confirmText || t("common.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
