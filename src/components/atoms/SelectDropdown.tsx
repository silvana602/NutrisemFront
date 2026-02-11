import React from "react";

interface SelectProps {
  label?: string;
  options: string[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const SelectDropdown: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange
}) => {
  return (
    <div className="flex flex-col">
      {label && (
        <span className="mb-1 text-xs font-semibold text-nutri-dark-grey">
          {label}
        </span>
      )}
      <select
        className="rounded-lg border border-nutri-light-grey bg-nutri-white px-3 py-2 text-sm text-nutri-dark-grey shadow-sm"
        value={value}
        onChange={onChange}
      >
        {options.map((op, i) => (
          <option key={i} value={op}>
            {op}
          </option>
        ))}
      </select>
    </div>
  );
};
