import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, icon }) => {
  return (
    <div className={`rounded-xl bg-nutri-white p-6 shadow-lg ${className}`}>
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4">
          {icon && <div className="text-nutri-secondary">{icon}</div>}
          {title && <h3 className="text-xl font-bold text-nutri-dark-grey">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
};
