import { Download, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { AppId } from "@/lib/api/types";

interface ProviderEmptyStateProps {
  appId: AppId;
  onCreate?: () => void;
  onImport?: () => void;
}

export function ProviderEmptyState({
  appId,
  onCreate,
  onImport,
}: ProviderEmptyStateProps) {
  const { t } = useTranslation();
  const showSnippetHint =
    appId === "claude" || appId === "codex" || appId === "gemini";

  return (
    <div className="flex min-h-[calc(100vh-18rem)] w-full items-center justify-center px-6 py-10">
      <div className="flex w-full max-w-[480px] flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-[80px] w-[80px] items-center justify-center" aria-hidden="true">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-[80px] w-[80px] text-foreground/10"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.28248 40.8332C8.28248 39.4525 9.40265 38.3332 10.7845 38.3332C28.7478 38.3332 43.31 52.8839 43.31 70.8332C43.31 72.2139 42.1899 73.3332 40.8081 73.3332C39.4263 73.3332 38.3061 72.2139 38.3061 70.8332C38.3061 55.6453 25.9842 43.3332 10.7845 43.3332C9.40265 43.3332 8.28248 42.2139 8.28248 40.8332ZM10.7845 48.3332C9.40265 48.3332 8.28248 49.4525 8.28248 50.8332C8.28248 52.2139 9.40265 53.3332 10.7845 53.3332C20.457 53.3332 28.2982 61.1682 28.2982 70.8332C28.2982 72.2139 29.4184 73.3332 30.8002 73.3332C32.182 73.3332 33.3022 72.2139 33.3022 70.8332C33.3022 58.4068 23.2206 48.3332 10.7845 48.3332ZM8.28248 60.8332C8.28248 59.4525 9.40265 58.3332 10.7845 58.3332C17.6934 58.3332 23.2943 63.9296 23.2943 70.8332C23.2943 72.2139 22.1741 73.3332 20.7923 73.3332C19.4105 73.3332 18.2904 72.2139 18.2904 70.8332C18.2904 66.691 14.9298 63.3332 10.7845 63.3332C9.40265 63.3332 8.28248 62.2139 8.28248 60.8332Z"
              fill="currentColor"
            />
            <path
              d="M6.66699 34.5613C7.84917 33.7849 9.26402 33.3332 10.7845 33.3332C31.5114 33.3332 48.314 50.1225 48.314 70.8332C48.314 71.7097 48.1635 72.5511 47.8869 73.333C59.6446 73.3287 65.6477 73.1981 69.4253 69.2937C73.3337 65.2541 73.3337 58.7527 73.3337 45.7497V40.6796C73.3337 33.0515 73.3337 29.2374 71.6016 26.0756C69.8696 22.9139 66.7053 20.9515 60.3767 17.0269L53.7048 12.8894C47.015 8.7408 43.6701 6.6665 39.9741 6.6665C36.2781 6.6665 32.9332 8.7408 26.2434 12.8894L19.5715 17.0269C13.2429 20.9515 10.0786 22.9139 8.34654 26.0756C7.1545 28.2517 6.78286 30.7367 6.66699 34.5613Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h3 className="text-center text-base font-semibold leading-tight tracking-tight text-foreground">
          {t("provider.noProviders")}
        </h3>
        <p className="mt-4 max-w-[480px] text-center text-sm leading-5 text-muted-foreground">
          {t("provider.noProvidersDescription")}
        </p>
        {showSnippetHint && (
          <p className="mt-1 max-w-[480px] text-center text-sm leading-5 text-muted-foreground">
            {t("provider.noProvidersDescriptionSnippet")}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="mr-2 h-4 w-4" />
              {t("provider.addProvider")}
            </Button>
          )}
          {onImport && (
            <Button variant="outline" onClick={onImport}>
              <Download className="mr-2 h-4 w-4" />
              {t("provider.importCurrent")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
