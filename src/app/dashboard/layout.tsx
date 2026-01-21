"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/components/layout/sidebar/Sidebar";
import { LoadingButton } from "@/components/ui/Spinner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, setSession, hydrated, setHydrated } = useAuthStore();

  useEffect(() => {
    if (hydrated) return;

    const saved = localStorage.getItem("session");
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch (error) {
        console.error("Error parsing session from localStorage", error);
        localStorage.removeItem("session");
      }
    }

    setHydrated(true);
  }, [hydrated, setSession, setHydrated]);

  if (!hydrated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingButton loading>Cargando...</LoadingButton>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
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
