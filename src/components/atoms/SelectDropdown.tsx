import React from "react";
import { colors } from "@/lib/colors";

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
        <span className="text-xs font-semibold mb-1" style={{ color: colors.darkGrey }}>
          {label}
        </span>
      )}
      <select
        className="border rounded-lg px-3 py-2 text-sm shadow-sm bg-white"
        style={{ borderColor: colors.lightGrey }}
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
