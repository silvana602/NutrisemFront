"use client";

import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/components/layout/sidebar/Sidebar";
import { LoadingButton } from "@/components/ui/Spinner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, hydrated } = useAuthStore();

  if (!hydrated) {
    return (
      <div className="flex min-h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] items-center justify-center">
        <LoadingButton loading>Cargando...</LoadingButton>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-nutri-secondary/35 bg-nutri-white p-5 shadow-sm">
          <p className="text-base font-semibold text-nutri-primary">
            Sesion no disponible
          </p>
          <p className="mt-1 text-sm text-nutri-dark-grey">
            No hay usuario activo. Inicie sesion para continuar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] items-start">
      <Sidebar />

      <main className="min-w-0 flex-1 p-3 sm:p-4">
        <div className="mx-auto w-full max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
