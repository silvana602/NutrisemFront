"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types/user";
import AlertDialog from "@/components/ui/AlertDialog";
import { db } from "@/mocks/db";
import { cn } from "@/lib/utils";

export default function UserMenu() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const activeRole = useAuthStore((s) => s.activeRole);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const logout = useAuthStore((s) => s.clearSession);

  const [open, setOpen] = useState(false);

  // 🔴 NUEVO: alertas separadas
  const [showPatientAlert, setShowPatientAlert] = useState(false);
  const [showClinicianAlert, setShowClinicianAlert] = useState(false);

  const ref = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        !ref.current?.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
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

  /* =========================
     VALIDACIONES DE ACCESO
  ========================= */

  const canAccessPatientPanel = () =>
    db.patients.some((p) => p.userId === user.userId);

  // 🔴 NUEVO
  const canAccessClinicianPanel = () =>
    Boolean(useAuthStore.getState().clinician);

  /* =========================
     ACCIONES
  ========================= */

  const onLogout = () => {
    logout();
    router.replace("/");
  };

  const switchPanel = (role: UserRole, path: string) => {
    // 🔴 VALIDACIÓN PACIENTE
    if (role === UserRole.patient && !canAccessPatientPanel()) {
      setShowPatientAlert(true);
      return;
    }

    // 🔴 VALIDACIÓN CLINICIAN
    if (role === UserRole.clinician && !canAccessClinicianPanel()) {
      setShowClinicianAlert(true);
      return;
    }

    setActiveRole(role);
    close();
    router.push(path);
  };

  const isAdmin = user.role === UserRole.admin;
  const isClinician = user.role === UserRole.clinician;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="
          flex items-center gap-2
          rounded-xl
          bg-[var(--color-nutri-white)]
          px-2 py-1
          shadow-sm
          hover:shadow-md
          transition-shadow
        "
      >
        <Avatar name={`${user.firstName} ${user.lastName}`} size={32} />
      </button>

      {/* Menu */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-nutri-light-grey bg-nutri-white/95 shadow-sm">
          {/* ADMIN */}
          {isAdmin && (
            <>
              <MenuButton
                active={activeRole === UserRole.admin}
                onClick={() => switchPanel(UserRole.admin, "/dashboard/admin")}
              >
                Panel de Administración
              </MenuButton>

              <MenuButton
                active={activeRole === UserRole.clinician}
                onClick={() =>
                  switchPanel(UserRole.clinician, "/dashboard/clinician")
                }
              >
                Panel del Salubrista
              </MenuButton>

              <MenuButton
                active={activeRole === UserRole.patient}
                onClick={() =>
                  switchPanel(UserRole.patient, "/dashboard/patient")
                }
              >
                Panel de Paciente
              </MenuButton>
            </>
          )}

          {/* CLINICIAN */}
          {isClinician && (
            <>
              <MenuButton
                active={activeRole === UserRole.clinician}
                onClick={() =>
                  switchPanel(UserRole.clinician, "/dashboard/clinician")
                }
              >
                Mi Panel Profesional
              </MenuButton>

              <MenuButton
                active={activeRole === UserRole.patient}
                onClick={() =>
                  switchPanel(UserRole.patient, "/dashboard/patient")
                }
              >
                Mi Panel Personal
              </MenuButton>
            </>
          )}

          <div className="my-2 h-px bg-nutri-light-grey" />

          {/* LOGOUT */}
          <button
            onClick={onLogout}
            className="mx-3 my-1 flex w-[calc(100%-1.5rem)] items-center rounded-xl px-6 py-3 text-left text-sm font-medium text-nutri-dark-grey transition-all duration-150 hover:bg-nutri-off-white"
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

      {/* 🔴 ALERTA CLINICIAN */}
      <AlertDialog
        open={showClinicianAlert}
        title="Salubrista no registrado"
        message="Este usuario no tiene un perfil profesional asociado. Por favor contacte al administrador."
        onClose={() => setShowClinicianAlert(false)}
      />
    </div>
  );
}

/* =========================
   MenuButton
========================= */
function MenuButton({
  onClick,
  children,
  active = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "mx-3 my-1 flex w-[calc(100%-1.5rem)] items-center rounded-xl px-6 py-3 text-left text-sm font-medium transition-all duration-150",
        active
          ? "bg-nutri-primary text-nutri-white shadow-sm"
          : "text-nutri-dark-grey hover:bg-nutri-off-white"
      )}
    >
      {children}
    </button>
  );
}
