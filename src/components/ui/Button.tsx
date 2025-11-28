import React from 'react';
import { colors } from '../../lib/colors';

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
  type = 'button' 
}) => {
  const baseStyles = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg';

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${className}`}
      style={{
        backgroundColor: variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.secondary : 'transparent',
        color: variant === 'outline' ? colors.primary : 'white',
        borderColor: variant === 'outline' ? colors.primary : 'transparent',
        border: variant === 'outline' ? `2px solid ${colors.primary}` : 'none'
      }}
    >
      {children}
    </button>
  );
};