"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types/user";
import AlertDialog from "@/components/ui/AlertDialog";
import { db } from "@/mocks/db";

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
        <div className="
          absolute right-0 mt-2 w-64 z-50
          rounded-2xl
          bg-[var(--color-nutri-white)]
          shadow-lg
          border border-[var(--color-nutri-light-grey)]
        ">
          {/* USER INFO */}
          <div className="flex items-center gap-3 px-4 py-4">
            <Avatar name={`${user.firstName} ${user.lastName}`} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--color-nutri-black)]">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-[var(--color-nutri-dark-grey)]">
                C.I. {user.identityNumber}
              </p>
            </div>
          </div>

          <div className="my-2 h-px bg-[var(--color-nutri-light-grey)]" />

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

          <div className="my-2 h-px bg-[var(--color-nutri-light-grey)]" />

          {/* LOGOUT */}
          <button
            onClick={onLogout}
            className="
              w-full text-left
              px-4 py-2.5
              text-sm font-semibold
              rounded-xl
              text-[var(--color-nutri-primary)]
              bg-[var(--color-nutri-primary)/5]
              border border-[var(--color-nutri-primary)/20]
              hover:bg-[var(--color-nutri-primary)/10]
              transition-all
            "
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
      className={`
        block w-full text-left
        px-4 py-2
        text-sm rounded-lg
        transition-colors

        text-[var(--color-nutri-dark-grey)]
        hover:bg-[var(--color-nutri-primary)/10]

        ${
          active
            ? "bg-[var(--color-nutri-primary)] text-[var(--color-nutri-white)]"
            : ""
        }
      `}
    >
      {children}
    </button>
  );
}
