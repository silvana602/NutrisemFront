"use client";

import React from "react";
import { cn } from "@/lib/utils";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-gray-900">
                    {title}
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                    {message}
                </p>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                    >
                        {actionLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
