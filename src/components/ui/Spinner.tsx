"use client";

import React from "react";

/* =========================
   Spinner
========================= */

interface SpinnerProps {
  size?: "md" | "lg" | "xl";
}

const Spinner: React.FC<SpinnerProps> = ({ size = "lg" }) => {
  const sizes = {
    md: "w-6 h-6 border-4",
    lg: "w-8 h-8 border-4",
    xl: "w-10 h-10 border-[5px]",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          ${sizes[size]}
          rounded-full
          animate-spin
          border-[var(--color-nutri-light-grey)]
          border-t-[var(--color-nutri-white)]
        `}
      />
    </div>
  );
};

/* =========================
   Loading Button
========================= */

interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  spinnerSize?: "md" | "lg" | "xl";
  className?: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  spinnerSize = "lg",
  className = "",
}) => {
  return (
    <button
      type="button"
      disabled={loading}
      className={`
        inline-flex items-center justify-center gap-3

        px-7 py-4
        rounded-2xl

        text-base font-semibold
        tracking-wide

        bg-[var(--color-nutri-primary)]
        text-[var(--color-nutri-white)]

        shadow-lg
        transition-all duration-200 ease-in-out

        hover:bg-[var(--color-nutri-secondary)]
        hover:shadow-xl

        active:scale-[0.97]

        focus:outline-none
        focus:ring-2
        focus:ring-[var(--color-nutri-secondary)]
        focus:ring-offset-2
        focus:ring-offset-[var(--color-nutri-off-white)]

        disabled:opacity-60
        disabled:cursor-not-allowed
        disabled:hover:shadow-lg

        ${className}
      `}
    >
      {loading && <Spinner size={spinnerSize} />}

      <span className={loading ? "opacity-90" : ""}>
        {children}
      </span>
    </button>
  );
};

export { LoadingButton };
