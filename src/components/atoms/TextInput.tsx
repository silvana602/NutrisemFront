import React from "react";
import { cn } from "@/lib/utils";

type TextInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> & {
  icon?: React.ReactNode;
  // Clase para el contenedor (mantiene compatibilidad con usos existentes).
  className?: string;
  // Clase opcional para el input.
  inputClassName?: string;
};

export const TextInput: React.FC<TextInputProps> = ({
  icon,
  className = "",
  inputClassName = "",
  ...inputProps
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
        className={cn(
          "w-full min-w-0 bg-transparent text-sm text-nutri-dark-grey outline-none placeholder:text-nutri-secondary/70",
          inputClassName
        )}
        {...inputProps}
      />
    </div>
  );
};
