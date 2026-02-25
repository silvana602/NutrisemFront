"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type TabItem<T extends string> = {
  id: T;
  label: string;
  disabled?: boolean;
};

type TabsProps<T extends string> = {
  tabs: readonly TabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  className?: string;
};

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: TabsProps<T>) {
  return (
    <div className={cn("w-full", className)}>
      <div className="nutri-platform-surface flex min-w-max gap-2 overflow-x-auto rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 sm:px-4 sm:text-sm",
              activeTab === tab.id
                ? "bg-[linear-gradient(135deg,#172A3A_0%,#567C8D_100%)] text-nutri-white shadow-[0_8px_16px_rgba(23,42,58,0.24)]"
                : "text-[var(--color-nutri-dark-grey)] hover:bg-white/70",
              tab.disabled ? "cursor-not-allowed opacity-45 hover:bg-transparent" : "hover:-translate-y-0.5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
