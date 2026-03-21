import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/components/theme-provider";

export function Toaster() {
  const { theme } = useTheme();

  // 将应用主题映射到 Sonner 的主题
  // 如果是 "system"，Sonner 会自己处理
  const sonnerTheme = theme === "system" ? "system" : theme;

  return (
    <SonnerToaster
      position="top-center"
      unstyled
      theme={sonnerTheme}
      toastOptions={{
        duration: 2000,
        unstyled: true,
        classNames: {
          toast:
            "group flex items-start gap-2 rounded-[10px] border-0 bg-card p-2 text-card-foreground shadow-lg dark:bg-white/5 dark:text-white dark:shadow-black/55",
          success:
            "text-emerald-600 dark:text-emerald-400 [&_[data-description]]:text-emerald-600/80 dark:[&_[data-description]]:text-emerald-400/80",
          content: "min-w-0 flex-1",
          icon: "mt-0.5 shrink-0",
          title: "text-sm font-semibold",
          description: "text-sm text-muted-foreground",
          closeButton:
            "order-last ml-auto shrink-0 self-start rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          actionButton:
            "rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        },
      }}
    />
  );
}
