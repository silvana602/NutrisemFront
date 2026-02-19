"use client";

import { TextInput } from "../atoms/TextInput";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  containerClassName?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Buscar por nombre del paciente o CI",
  containerClassName,
  className,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(e.target.value);

  return (
    <div className={cn("mt-4 w-full max-w-full sm:max-w-xl", containerClassName)}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        icon={
          <Search
            size={20}
            className="text-current"
          />
        }
        className={cn("w-full", className)}
      />
    </div>
  );
};
