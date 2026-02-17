"use client";

import React from "react";

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
    <div className={`w-full border-b border-[var(--color-nutri-light-grey)] ${className}`.trim()}>
      <div className="flex min-w-max gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            className={`
              shrink-0 rounded-t-md px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm
              ${
                activeTab === tab.id
                  ? "bg-[var(--color-nutri-secondary)] text-nutri-white"
                  : "bg-transparent text-[var(--color-nutri-dark-grey)] hover:bg-[var(--color-nutri-light-grey)]"
              }
              ${tab.disabled ? "cursor-not-allowed opacity-45 hover:bg-transparent" : ""}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
