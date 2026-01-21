"use client";

import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  colorClass?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  colorClass = "border-[var(--color-nutri-white)]",
}) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-4",
    lg: "w-10 h-10 border-4",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          ${sizes[size]}
          rounded-full animate-spin
          border-[var(--color-nutri-light-grey)]
          border-t-transparent
          ${colorClass}
        `}
      />
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
      type="button"
      disabled={loading}
      className={`
        inline-flex items-center justify-center gap-2
        px-5 py-2.5 rounded-xl font-semibold text-sm
        bg-[var(--color-nutri-primary)]
        text-[var(--color-nutri-white)]
        shadow-md
        transition-all duration-200 ease-in-out

        hover:bg-[var(--color-nutri-secondary)]
        hover:shadow-lg

        active:scale-[0.98]

        focus:outline-none
        focus:ring-2
        focus:ring-[var(--color-nutri-secondary)]
        focus:ring-offset-2
        focus:ring-offset-[var(--color-nutri-off-white)]

        disabled:opacity-60
        disabled:cursor-not-allowed
        disabled:hover:shadow-md

        ${className}
      `}
    >
      {loading && (
        <Spinner
          size={spinnerSize}
          colorClass="border-t-[var(--color-nutri-white)]"
        />
      )}
      <span className={loading ? "opacity-90" : ""}>
        {children}
      </span>
    </button>
  );
};

export { LoadingButton };
