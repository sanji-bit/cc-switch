import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProviderIcon } from "@/components/ProviderIcon";
import { IconPicker } from "@/components/IconPicker";
import { getIconMetadata } from "@/icons/extracted/metadata";
import type { UseFormReturn } from "react-hook-form";
import type { ProviderFormData } from "@/lib/schemas/provider";

interface BasicFormFieldsProps {
  form: UseFormReturn<ProviderFormData>;
  /** Slot to render content between icon and name fields */
  beforeNameSlot?: ReactNode;
}

export function BasicFormFields({
  form,
  beforeNameSlot,
}: BasicFormFieldsProps) {
  const { t } = useTranslation();
  const [iconDialogOpen, setIconDialogOpen] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement | null>(null);
  const iconTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!iconDialogOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        iconPickerRef.current?.contains(target) ||
        iconTriggerRef.current?.contains(target)
      ) {
        return;
      }
      setIconDialogOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIconDialogOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [iconDialogOpen]);

  const currentIcon = form.watch("icon");
  const currentIconColor = form.watch("iconColor");
  const providerName = form.watch("name") || "A";
  const effectiveIconColor =
    currentIconColor ||
    (currentIcon ? getIconMetadata(currentIcon)?.defaultColor : undefined);

  const handleIconSelect = (icon: string) => {
    const meta = getIconMetadata(icon);
    form.setValue("icon", icon);
    form.setValue("iconColor", meta?.defaultColor ?? "");
    setIconDialogOpen(false);
  };

  return (
    <>
      {/* 图标选择区域 - 顶部居中，可选 */}
      <div className="relative mb-6 flex justify-center">
        <button
          ref={iconTriggerRef}
          type="button"
          onClick={() => setIconDialogOpen((open) => !open)}
          className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-muted bg-muted/30 p-3 transition-colors hover:border-primary hover:bg-muted/50"
          title={
            currentIcon
              ? t("providerIcon.clickToChange", {
                  defaultValue: "点击更换图标",
                })
              : t("providerIcon.clickToSelect", {
                  defaultValue: "点击选择图标",
                })
          }
        >
          <ProviderIcon
            icon={currentIcon}
            name={providerName}
            color={effectiveIconColor}
            size={48}
          />
        </button>

        {iconDialogOpen && (
          <div
            ref={iconPickerRef}
            className="absolute left-1/2 top-full z-20 mt-3 w-fit -translate-x-1/2 rounded-[24px] border border-border/80 bg-background p-3 shadow-2xl shadow-black/12"
          >
            <div className="rounded-[18px] bg-muted/20 p-2">
              <IconPicker
                value={currentIcon}
                onValueChange={handleIconSelect}
                color={effectiveIconColor}
                variant="compact"
                showSearch
                previewName={providerName}
              />
            </div>
          </div>
        )}
      </div>

      {/* Slot for additional fields between icon and name */}
      {beforeNameSlot}

      {/* 基础信息 - 网格布局 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("provider.name")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("provider.namePlaceholder")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("provider.notes")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t("provider.notesPlaceholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="websiteUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("provider.websiteUrl")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("providerForm.websiteUrlPlaceholder")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
