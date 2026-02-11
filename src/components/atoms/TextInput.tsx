import React from "react";

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
      className={`group flex items-center rounded-xl border border-nutri-light-grey bg-nutri-white px-3 py-2 shadow-sm ${className}`}
    >
      {icon && <div className="mr-2 text-nutri-secondary">{icon}</div>}
      <input
        className="w-full bg-transparent text-sm text-nutri-dark-grey outline-none"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
