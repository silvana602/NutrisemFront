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
            className="text-[#6B7280] transition-colors group-focus-within:text-[#2E7D32]"
          />
        }
        className={`
          w-full 
          rounded-lg 
          bg-[#F1F8E9] 
          border border-[#C8E6C9] 
          px-4 py-2 
          focus:ring-2 focus:ring-[#A5D6A7] 
          focus:border-[#2E7D32] 
          transition-all 
          placeholder-gray-400
        `}
      />
    </div>
  );
};
