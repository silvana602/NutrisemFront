import React from "react";

type SettingsToggleFieldProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function SettingsToggleField({
  label,
  description,
  checked,
  onChange,
}: SettingsToggleFieldProps) {
  return (
    <label className="flex items-start justify-between gap-3 rounded-xl border border-nutri-light-grey bg-white/80 px-3 py-2.5">
      <span className="space-y-0.5">
        <span className="block text-sm font-semibold text-nutri-dark-grey">{label}</span>
        <span className="block text-xs text-nutri-dark-grey/80">{description}</span>
      </span>

      <span className="relative mt-0.5 inline-flex h-6 w-11 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full border border-nutri-light-grey bg-nutri-off-white transition-colors peer-checked:border-nutri-secondary/50 peer-checked:bg-nutri-secondary/25" />
        <span className="pointer-events-none absolute left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
