"use client";

import { TextInput } from "../atoms/TextInput";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Buscar por nombre del paciente o CI",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(e.target.value);

  return (
    <div className="mt-4 w-full max-w-full sm:max-w-xl">
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
        className="w-full"
      />
    </div>
  );
};
