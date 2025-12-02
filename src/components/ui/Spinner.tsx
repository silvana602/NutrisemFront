"use client";

import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = "md", color = "text-[#41B3A3]" }) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-4",
    lg: "w-10 h-10 border-4",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`
          rounded-full animate-spin
          border-gray-200 border-t-transparent
          ${sizes[size]} ${color}
        `}
      ></div>
    </div>
  );
};

interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  spinnerSize?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  spinnerSize = "sm",
  className = "",
}) => {
  return (
    <button
      disabled={loading}
      className={`
        px-4 py-2 rounded-lg font-medium flex items-center gap-2
        bg-[#41B3A3] text-white hover:bg-[#37998C] transition
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading && <Spinner size={spinnerSize} color="text-white" />}
      {children}
    </button>
  );
};

export { LoadingButton };
