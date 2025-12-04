"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/components/layout/Sidebar";
import { LoadingButton } from "@/components/ui/Spinner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    const saved = localStorage.getItem("session");
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing session from localStorage", e);
      }
    }
    setHydrated(true);
  }, [setSession, setHydrated]);

  if (!hydrated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingButton loading={true}>Cargando...</LoadingButton>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-center text-red-600">No hay usuario. Inicie sesión.</div>
    );
  }

  const role = user.role;

  return (
    <div className="flex min-h-screen">
      {/* 💡 Sidebar fluye en el layout */}
      <Sidebar role={role} />

      {/* Contenido */}
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  );
}
