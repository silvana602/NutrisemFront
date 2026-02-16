import React from "react";
import { cn } from "@/lib/utils";

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
  className = "",
  type = "text",
}) => {
  return (
    <div
      className={cn("group flex items-center gap-2 nutri-input", className)}
    >
      {icon && (
        <div className="text-nutri-secondary transition-colors group-focus-within:text-nutri-primary">
          {icon}
        </div>
      )}
      <input
        className="w-full min-w-0 bg-transparent text-sm text-nutri-dark-grey outline-none placeholder:text-nutri-secondary/70"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
