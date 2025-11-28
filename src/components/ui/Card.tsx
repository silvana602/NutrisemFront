import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, icon }) => {
  return (
    <div
      className={`rounded-xl shadow-lg p-6 ${className}`}
      style={{ backgroundColor: 'white' }}
    >
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4">
          {icon && <div style={{ color: '#4A7BA7' }}>{icon}</div>}
          {title && <h3 className="text-xl font-bold" style={{ color: '#3E4A4F' }}>{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
};