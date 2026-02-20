"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AlertDialog from "@/components/ui/AlertDialog";
import Avatar from "@/components/ui/Avatar";
import { logoutClient } from "@/lib/auth/client";
import { resolveDashboardPathByRole } from "@/lib/auth/roleRouting";
import { cn } from "@/lib/utils";
import { db } from "@/mocks/db";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types/user";

export default function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);
  const setActiveRole = useAuthStore((state) => state.setActiveRole);
  const clearSession = useAuthStore((state) => state.clearSession);

  const [open, setOpen] = useState(false);
  const [showPatientAlert, setShowPatientAlert] = useState(false);
  const [showClinicianAlert, setShowClinicianAlert] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        !menuRef.current?.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        close();
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [close]);

  if (!user) return null;

  const canAccessPatientPanel = () =>
    db.patients.some((patient) => patient.userId === user.userId);

  const canAccessClinicianPanel = () => Boolean(useAuthStore.getState().clinician);

  const onLogout = async () => {
    await logoutClient(clearSession);
    router.replace("/");
  };

  const switchPanel = (role: UserRole) => {
    if (role === UserRole.patient && !canAccessPatientPanel()) {
      setShowPatientAlert(true);
      return;
    }

    if (role === UserRole.clinician && !canAccessClinicianPanel()) {
      setShowClinicianAlert(true);
      return;
    }

    setActiveRole(role);
    close();
    router.push(resolveDashboardPathByRole(role));
  };

  const isAdmin = user.role === UserRole.admin;
  const isClinician = user.role === UserRole.clinician;

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((previous) => !previous)}
        className="flex items-center gap-2 rounded-xl bg-[var(--color-nutri-white)] px-2 py-1 shadow-sm transition-shadow hover:shadow-md"
      >
        <Avatar name={`${user.firstName} ${user.lastName}`} size={32} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(18rem,calc(100vw-1rem))] rounded-xl border border-nutri-light-grey bg-nutri-white/95 shadow-sm">
          {isAdmin && (
            <>
              <MenuButton
                active={activeRole === UserRole.admin}
                onClick={() => switchPanel(UserRole.admin)}
              >
                Panel de Administracion
              </MenuButton>

              <MenuButton
                active={activeRole === UserRole.clinician}
                onClick={() => switchPanel(UserRole.clinician)}
              >
                Panel del Salubrista
              </MenuButton>

              <MenuButton
                active={activeRole === UserRole.patient}
                onClick={() => switchPanel(UserRole.patient)}
              >
                Panel de Paciente
              </MenuButton>
            </>
          )}

          {isClinician && (
            <>
              <MenuButton
                active={activeRole === UserRole.clinician}
                onClick={() => switchPanel(UserRole.clinician)}
              >
                Mi Panel Profesional
              </MenuButton>

              <MenuButton
                active={activeRole === UserRole.patient}
                onClick={() => switchPanel(UserRole.patient)}
              >
                Mi Panel Personal
              </MenuButton>
            </>
          )}

          <div className="my-2 h-px bg-nutri-light-grey" />

          <button
            onClick={onLogout}
            className="mx-3 my-1 flex w-[calc(100%-1.5rem)] items-center rounded-xl px-6 py-3 text-left text-sm font-medium text-nutri-dark-grey transition-all duration-150 hover:bg-nutri-off-white"
          >
            Cerrar sesion
          </button>
        </div>
      )}

      <AlertDialog
        open={showPatientAlert}
        title="Paciente no registrado"
        message="Este usuario no tiene un perfil de paciente asociado. Por favor contacte al administrador."
        onClose={() => setShowPatientAlert(false)}
      />

      <AlertDialog
        open={showClinicianAlert}
        title="Salubrista no registrado"
        message="Este usuario no tiene un perfil profesional asociado. Por favor contacte al administrador."
        onClose={() => setShowClinicianAlert(false)}
      />
    </div>
  );
}

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
