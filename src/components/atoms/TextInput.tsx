import React from "react";
import { colors } from "@/lib/colors";

interface TextInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  className?: string; 
  label?: string;
  type?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  placeholder,
  value,
  onChange,
  icon,
}) => {
  return (
    <div className="flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm"
        style={{ borderColor: colors.lightGrey }}
    >
      {icon && <div className="mr-2 text-gray-400">{icon}</div>}
      <input
        className="w-full outline-none text-sm"
        style={{ color: colors.darkGrey }}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
