"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Backdrop } from "@/components/ui/Backdrop";

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!open || !mounted) return null;

    return createPortal(
        <>
            <Backdrop show onClick={onClose} className="z-[190] bg-[var(--color-nutri-black)]/55" />

            <div className="fixed inset-0 z-[200] grid h-dvh w-screen place-items-center p-4">

                {/* Dialog */}
                <div
                    role="dialog"
                    aria-modal="true"
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
        </>,
        document.body
    );
}
