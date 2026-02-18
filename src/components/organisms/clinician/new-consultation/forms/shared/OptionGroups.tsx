"use client";

import { cn } from "@/lib/utils";

type OptionGroupBaseProps = {
  label: string;
  options: readonly string[];
  disabled?: boolean;
  columnsClassName?: string;
};

function OptionLabel({
  option,
  checked,
  disabled,
  onChange,
}: {
  option: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium sm:text-sm",
        checked
          ? "border-nutri-primary bg-nutri-primary/10 text-nutri-primary"
          : "border-nutri-light-grey bg-nutri-white text-nutri-dark-grey",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="h-4 w-4 rounded border-nutri-light-grey accent-nutri-primary"
        onChange={onChange}
      />
      <span>{option}</span>
    </label>
  );
}

export function MultiSelectOptionGroup({
  label,
  values,
  options,
  exclusiveOptions = [],
  disabled,
  columnsClassName = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  onChange,
}: OptionGroupBaseProps & {
  values?: string[] | string;
  exclusiveOptions?: readonly string[];
  onChange: (value: string[]) => void;
}) {
  const selectedValues = Array.isArray(values)
    ? values.filter((item): item is string => typeof item === "string")
    : typeof values === "string" && values.trim()
      ? [values]
      : [];

  const hasExclusiveSelected = selectedValues.some((value) =>
    exclusiveOptions.includes(value)
  );

  const toggleValue = (value: string) => {
    const isSelected = selectedValues.includes(value);
    if (isSelected) {
      onChange(selectedValues.filter((item) => item !== value));
      return;
    }

    if (exclusiveOptions.includes(value)) {
      onChange([value]);
      return;
    }

    const withoutExclusives = selectedValues.filter(
      (item) => !exclusiveOptions.includes(item)
    );
    onChange([...withoutExclusives, value]);
  };

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-nutri-dark-grey">{label}</legend>
      <div className={cn("grid gap-2", columnsClassName)}>
        {options.map((option) => {
          const checked = selectedValues.includes(option);
          const optionDisabled =
            disabled || (hasExclusiveSelected && !exclusiveOptions.includes(option));

          return (
            <OptionLabel
              key={option}
              option={option}
              checked={checked}
              disabled={optionDisabled}
              onChange={() => toggleValue(option)}
            />
          );
        })}
      </div>
    </fieldset>
  );
}

export function SingleSelectOptionGroup({
  label,
  value,
  options,
  disabled,
  columnsClassName = "grid-cols-1 sm:grid-cols-2",
  onChange,
}: OptionGroupBaseProps & {
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-nutri-dark-grey">{label}</legend>
      <div className={cn("grid gap-2", columnsClassName)}>
        {options.map((option) => {
          const checked = value === option;
          return (
            <OptionLabel
              key={option}
              option={option}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(checked ? undefined : option)}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
