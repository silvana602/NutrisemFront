import React from 'react';
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, icon }) => {
  return (
    <div className={cn("nutri-surface p-6", className)}>
      {(title || icon) && (
        <div className="mb-4 flex items-center gap-3">
          {icon && <div className="text-nutri-secondary">{icon}</div>}
          {title && <h3 className="text-lg font-semibold text-nutri-dark-grey">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
};
