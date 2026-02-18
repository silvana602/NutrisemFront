"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Backdrop } from "@/components/ui/Backdrop";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Guardar",
  cancelLabel = "Cancelar",
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <Backdrop show onClick={onCancel} className="z-[190] bg-[var(--color-nutri-black)]/55" />

      <div className="fixed inset-0 z-[200] grid h-dvh w-screen place-items-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="relative z-10 w-full max-w-[90%] rounded-xl bg-[var(--color-nutri-white)] p-4 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6"
        >
          <h2 className="text-base font-semibold text-[var(--color-nutri-primary)] sm:text-lg">
            {title}
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-[var(--color-nutri-dark-grey)] sm:mt-3 sm:text-sm">
            {message}
          </p>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button variant="primary" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
