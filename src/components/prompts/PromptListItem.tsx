import React from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Prompt } from "@/lib/api";
import PromptToggle from "./PromptToggle";

interface PromptListItemProps {
  id: string;
  prompt: Prompt;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const actionButtonClass =
  "h-8 w-8 rounded-[8px] p-1 text-muted-foreground transition-colors opacity-40 group-hover:opacity-100 hover:bg-muted/70 hover:text-foreground";

const PromptListItem: React.FC<PromptListItemProps> = ({
  id,
  prompt,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  const enabled = prompt.enabled === true;

  return (
    <div className="group flex w-full flex-col overflow-hidden rounded-[24px] border border-border/80 bg-card text-card-foreground transition-shadow duration-200 hover:shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)]">
      <div className="flex min-w-0 flex-col gap-2 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="min-w-0 text-[18px] font-semibold leading-5 text-foreground">
            {prompt.name}
          </h3>
          <span
            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[14px] font-semibold transition-opacity ${
              enabled
                ? "bg-emerald-100 text-emerald-700 opacity-100 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "opacity-0"
            }`}
            aria-hidden={!enabled}
          >
            {t("provider.inUse", { defaultValue: "已启用" })}
          </span>
        </div>

        {prompt.description && (
          <p className="text-[15px] leading-5 text-muted-foreground line-clamp-2">
            {prompt.description}
          </p>
        )}
      </div>

      <div className="mt-auto px-4 pb-3">
        <div className="flex w-full items-center gap-3 border-t-[0.5px] border-border/50 pt-3">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onEdit(id)}
              title={t("common.edit")}
              className={actionButtonClass}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onDelete(id)}
              title={t("common.delete")}
              className={`${actionButtonClass} hover:text-red-500 dark:hover:text-red-400`}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <PromptToggle
              enabled={enabled}
              onChange={(newEnabled) => onToggle(id, newEnabled)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptListItem;
