"use client";

import React from "react";
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
  showCancel?: boolean;
  disableConfirm?: boolean;
  disableCancel?: boolean;
  disableBackdropClose?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Guardar",
  cancelLabel = "Cancelar",
  showCancel = true,
  disableConfirm = false,
  disableCancel = false,
  disableBackdropClose = false,
}: ConfirmDialogProps) {
  if (!open) return null;
  if (typeof window === "undefined") return null;

  return createPortal(
    <>
      <Backdrop
        show
        onClick={disableBackdropClose ? undefined : onCancel}
        className="z-[190] bg-[var(--color-nutri-black)]/55"
      />

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
            {showCancel && (
              <Button variant="outline" disabled={disableCancel} onClick={onCancel}>
                {cancelLabel}
              </Button>
            )}
            <Button variant="primary" disabled={disableConfirm} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
