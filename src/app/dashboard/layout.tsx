"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/components/layout/Sidebar";
import { LoadingButton } from "@/components/ui/Spinner"; // spinner existente

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // Loader mientras el store se hidrata
  if (!hydrated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingButton loading={true}>Cargando...</LoadingButton>
      </div>
    );
  }

  // No hay usuario
  if (!user) {
    return (
      <div className="p-4 text-center text-red-600">
        No hay usuario. Inicie sesión.
      </div>
    );
  }

  // Ahora sí tenemos un usuario, garantizamos que role sea de tipo Role
  const role = user.role;

  return (
    <div className="flex">
      <Sidebar role={role} />
      <main className="flex-1 bg-gray-100 min-h-screen p-4 lg:ml-64 mt-14 lg:mt-0">
        {children}
      </main>
    </div>
  );
}
