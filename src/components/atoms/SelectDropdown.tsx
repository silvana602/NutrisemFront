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
        <span className="nutri-label text-xs">
          {label}
        </span>
      )}
      <select
        className="nutri-input pr-8 text-sm"
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
