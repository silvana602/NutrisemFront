"use client";

import React from "react";

interface AlertDialogProps {
    open: boolean;
    title: string;
    message: string;
    onClose: () => void;
    actionLabel?: string;
}

export default function AlertDialog({
    open,
    title,
    message,
    onClose,
    actionLabel = "Aceptar",
}: AlertDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-[var(--color-nutri-black)]/50"
                onClick={onClose}
            />

            {/* Dialog */}
            <div
                className="
          relative z-10 w-full

          max-w-[90%]
          sm:max-w-md

          rounded-xl sm:rounded-2xl

          bg-[var(--color-nutri-white)]

          p-4 sm:p-6

          shadow-2xl
        "
            >
                <h2
                    className="
            text-base sm:text-lg
            font-semibold
            text-[var(--color-nutri-primary)]
          "
                >
                    {title}
                </h2>

                <p
                    className="
            mt-2 sm:mt-3
            text-xs sm:text-sm
            leading-relaxed
            text-[var(--color-nutri-dark-grey)]
          "
                >
                    {message}
                </p>

                <div className="mt-5 sm:mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="
                rounded-lg

                px-4 py-2
                sm:px-5 sm:py-2.5

                text-xs sm:text-sm
                font-medium

                bg-[var(--color-nutri-primary)]
                text-[var(--color-nutri-white)]

                transition-colors

                hover:bg-[var(--color-nutri-secondary)]

                focus:outline-none
                focus:ring-2
                focus:ring-[var(--color-nutri-secondary)]
            "
                    >
                        {actionLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
