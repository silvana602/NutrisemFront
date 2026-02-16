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
      <div className="flex min-h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] items-center justify-center text-nutri-primary">
        No hay usuario. Inicie sesión.
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
