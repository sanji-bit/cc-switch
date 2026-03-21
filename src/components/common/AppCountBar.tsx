import React from "react";
import type { AppId } from "@/lib/api/types";
import { APP_IDS, APP_ICON_MAP } from "@/config/appConfig";

interface AppCountBarProps {
  totalLabel: string;
  totalCount: number;
  counts: Record<AppId, number>;
  appIds?: AppId[];
}

export const AppCountBar: React.FC<AppCountBarProps> = ({
  totalLabel,
  totalCount,
  counts,
  appIds = APP_IDS,
}) => {
  const items = [
    { key: "total", label: totalLabel, value: totalCount, icon: null },
    ...appIds.map((app) => ({
      key: app,
      label: APP_ICON_MAP[app].label,
      value: counts[app],
      icon: APP_ICON_MAP[app].icon,
    })),
  ];

  return (
    <div className="mb-5 mt-3 flex-shrink-0 overflow-hidden rounded-2xl bg-primary/[0.08]">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.key}
            className="relative flex min-w-0 items-start px-6 py-6"
          >
            {index > 0 ? (
              <span className="absolute left-0 top-4 bottom-4 w-px bg-border/50" />
            ) : null}
            <div className="min-w-0">
              <div className="text-[28px] font-medium leading-none text-foreground">
                {item.value}
              </div>
              <div className="mt-3 flex min-w-0 items-center gap-1 text-[14px] font-medium text-muted-foreground/80">
                {item.icon ? (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-foreground/80 [&_img]:h-4 [&_img]:w-4 [&_svg]:h-4 [&_svg]:w-4">
                    {item.icon}
                  </span>
                ) : null}
                <span className="truncate">{item.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
