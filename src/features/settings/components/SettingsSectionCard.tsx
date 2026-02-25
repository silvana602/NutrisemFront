import React from "react";
import { cn } from "@/lib/utils";

type SettingsSectionCardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function SettingsSectionCard({
  title,
  description,
  icon,
  className,
  children,
}: SettingsSectionCardProps) {
  return (
    <section className={cn("nutri-platform-surface space-y-4 p-4 sm:p-5", className)}>
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          {icon ? (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-nutri-light-grey bg-white text-nutri-primary">
              {icon}
            </span>
          ) : null}
          <h2 className="text-base font-semibold text-nutri-primary sm:text-lg">{title}</h2>
        </div>
        <p className="text-sm text-nutri-dark-grey/85">{description}</p>
      </header>

      {children}
    </section>
  );
}
