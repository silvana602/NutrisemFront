import React from 'react';
import { cn } from "@/lib/utils";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  type = 'button',
  disabled = false,
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nutri-secondary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-nutri-off-white disabled:cursor-not-allowed disabled:opacity-60";
  const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      "border-transparent bg-nutri-primary text-nutri-white shadow-[0_8px_20px_rgba(23,42,58,0.18)] hover:-translate-y-0.5 hover:bg-nutri-secondary",
    secondary:
      "border-transparent bg-nutri-secondary text-nutri-white shadow-[0_8px_20px_rgba(86,124,141,0.2)] hover:-translate-y-0.5 hover:bg-nutri-primary",
    outline:
      "border-nutri-primary/20 bg-nutri-white text-nutri-primary hover:bg-nutri-off-white hover:border-nutri-primary/30",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      {children}
    </button>
  );
};
