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
    <div className="w-full max-w-full sm:max-w-xl mt-4 px-2">
      <TextInput
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        icon={
          <Search
            size={20}
            className="text-nutri-dark-grey transition-colors group-focus-within:text-nutri-primary"
          />
        }
        className={`
          w-full 
          rounded-lg 
          bg-nutri-white 
          border border-nutri-light-grey
          px-4 py-2 
          focus-within:ring-2 focus-within:ring-nutri-secondary/30
          focus-within:border-nutri-secondary
          transition-all 
          placeholder:text-nutri-secondary
        `}
      />
    </div>
  );
};
