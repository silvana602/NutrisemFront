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
      <div className="flex justify-center items-center min-h-screen">
        <LoadingButton loading>Cargando...</LoadingButton>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen text-nutri-primary">
        No hay usuario. Inicie sesión.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          <div className="max-w-[1400px] w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
