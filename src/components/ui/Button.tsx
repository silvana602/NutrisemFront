import React from 'react';

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
    'rounded-lg border-2 px-6 py-3 font-semibold transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60';
  const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'border-transparent bg-nutri-primary text-nutri-white',
    secondary: 'border-transparent bg-nutri-secondary text-nutri-white',
    outline: 'border-nutri-primary bg-transparent text-nutri-primary',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
