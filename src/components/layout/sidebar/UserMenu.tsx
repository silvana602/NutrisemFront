"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types/user";
import AlertDialog from "@/components/ui/AlertDialog";

export default function UserMenu() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const activeRole = useAuthStore((s) => s.activeRole);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const logout = useAuthStore((s) => s.clearSession);

  const [open, setOpen] = useState(false);
  const [showPatientAlert, setShowPatientAlert] = useState(false);

  const ref = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
        close();
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [close]);

  if (!user) return null;

  const canAccessPatientPanel = () => {
    return Boolean(user.patientId); // ✅ Asegúrate de que user tenga patientId
  };

  const onLogout = () => {
    logout();
    router.replace("/");
  };

  const switchPanel = (role: UserRole, path: string) => {
    if (role === UserRole.patient && !canAccessPatientPanel()) {
      setShowPatientAlert(true);
      return;
    }

    setActiveRole(role); // Cambiamos rol activo
    close();
    router.push(path);
  };

  const baseRole = user.role as UserRole;
  const isAdmin = baseRole === UserRole.admin;
  const isClinician = baseRole === UserRole.clinician;

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl bg-(--color-nutri-white) px-2 py-1 shadow-sm hover:shadow-md transition-shadow"
      >
        <Avatar name={`${user.firstName} ${user.lastName}`} size={32} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 z-50 rounded-2xl bg-(--color-nutri-white) shadow-lg border border-(--color-nutri-light-grey) animate-[fadeIn_0.15s_ease-out]">
          <div className="flex items-center gap-3 px-4 py-4">
            <Avatar name={`${user.firstName} ${user.lastName}`} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-(--color-nutri-black)">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-(--color-nutri-dark-grey)">
                {user.identityNumber}
              </p>
            </div>
          </div>

          <div className="my-2 h-px bg-(--color-nutri-light-grey)" />

          {/* ADMIN */}
          {isAdmin && (
            <>
              <MenuButton onClick={() => switchPanel(UserRole.admin, "/dashboard/admin")}>
                Panel de Administración
              </MenuButton>
              <MenuButton onClick={() => switchPanel(UserRole.clinician, "/dashboard/clinician")}>
                Panel del Salubrista
              </MenuButton>
              <MenuButton onClick={() => switchPanel(UserRole.patient, "/dashboard/patient")}>
                Panel de Paciente
              </MenuButton>
            </>
          )}

          {/* CLINICIAN */}
          {isClinician && (
            <>
              <MenuButton onClick={() => switchPanel(UserRole.clinician, "/dashboard/clinician")}>
                Mi Panel Profesional
              </MenuButton>
              <MenuButton onClick={() => switchPanel(UserRole.patient, "/dashboard/patient")}>
                Mi Panel Personal
              </MenuButton>
            </>
          )}

          {/* CONFIG */}
          <MenuButton onClick={() => { close(); router.push("/dashboard/settings"); }}>
            Configuración
          </MenuButton>

          <div className="my-2 h-px bg-(--color-nutri-light-grey)" />

          {/* LOGOUT */}
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      )}

      {/* ALERTA PACIENTE */}
      <AlertDialog
        open={showPatientAlert}
        title="Paciente no registrado"
        message="Este usuario no tiene un perfil de paciente asociado. Por favor contacte al administrador."
        onClose={() => setShowPatientAlert(false)}
      />
    </div>
  );
}

function MenuButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-left px-4 py-2 text-sm rounded-lg text-(--color-nutri-dark-grey) hover:bg-(--color-nutri-primary)/10 transition-colors"
    >
      {children}
    </button>
  );
}
