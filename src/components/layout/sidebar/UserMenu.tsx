"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import AlertDialog from "@/components/ui/AlertDialog";
import Avatar from "@/components/ui/Avatar";
import { logoutClient } from "@/lib/auth/client";
import {
  resolveDashboardPathByRole,
  resolveSettingsPathByRole,
} from "@/lib/auth/roleRouting";
import { cn } from "@/lib/utils";
import { db } from "@/mocks/db";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types/user";
import { useUserSettings } from "@/features/settings/hooks/useUserSettings";

type MenuEntry = {
  role: UserRole;
  label: string;
  icon: React.ElementType;
};

function resolveRoleLabel(role: UserRole): string {
  if (role === UserRole.admin) return "Administrador";
  if (role === UserRole.clinician) return "Clínico";
  return "Paciente";
}

export default function UserMenu() {
  const router = useRouter();
  const pathname = usePathname();
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

  const currentRole = activeRole ?? user.role;
  const { fotoPerfil: profilePhoto } = useUserSettings(user.userId);

  const canAccessPatientPanel = () =>
    db.patients.some((patient) => patient.userId === user.userId);

  const canAccessClinicianPanel = () => Boolean(useAuthStore.getState().clinician);

  const menuEntries: MenuEntry[] =
    user.role === UserRole.admin
      ? [
          {
            role: UserRole.admin,
            label: "Panel de Administración",
            icon: ShieldCheck,
          },
          {
            role: UserRole.clinician,
            label: "Panel del Salubrista",
            icon: Stethoscope,
          },
          {
            role: UserRole.patient,
            label: "Panel de Paciente",
            icon: UserRound,
          },
        ]
      : user.role === UserRole.clinician
        ? [
            {
              role: UserRole.clinician,
              label: "Mi Panel Profesional",
              icon: Stethoscope,
            },
            {
              role: UserRole.patient,
              label: "Mi Panel Personal",
              icon: UserRound,
            },
          ]
        : [];
  const settingsPath = resolveSettingsPathByRole(currentRole);
  const isSettingsActive =
    pathname === settingsPath || pathname?.startsWith(settingsPath + "/");

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

  const openSettings = () => {
    close();
    router.push(settingsPath);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((previous) => !previous)}
        className="group flex items-center gap-2 rounded-2xl border border-white/75 bg-white/80 px-2.5 py-1.5 shadow-[0_8px_18px_rgba(18,33,46,0.12)] transition-all hover:-translate-y-0.5 hover:bg-white"
      >
        <Avatar name={`${user.firstName} ${user.lastName}`} src={profilePhoto} size={32} />
        <ChevronDown
          size={16}
          className={cn(
            "text-nutri-primary/80 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-white/80 bg-[linear-gradient(155deg,rgba(251,249,241,0.98)_0%,rgba(245,239,235,0.93)_100%)] p-2 shadow-[0_24px_38px_rgba(18,33,46,0.26)]">
          <div className="mx-1 mb-2 rounded-xl border border-white/85 bg-white/70 p-3 shadow-[0_8px_16px_rgba(18,33,46,0.08)]">
            <div className="flex items-center gap-3">
              <Avatar name={`${user.firstName} ${user.lastName}`} src={profilePhoto} size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-nutri-black">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-xs text-nutri-dark-grey/80">C.I. {user.identityNumber}</p>
              </div>
              <span className="ml-auto inline-flex rounded-full border border-nutri-secondary/30 bg-nutri-secondary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-nutri-primary">
                {resolveRoleLabel(currentRole)}
              </span>
            </div>
          </div>

          {menuEntries.length > 0 && (
            <>
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-nutri-dark-grey/70">
                Cambiar panel
              </p>
              {menuEntries.map((entry) => (
                <MenuButton
                  key={entry.role}
                  active={currentRole === entry.role}
                  onClick={() => switchPanel(entry.role)}
                  icon={entry.icon}
                >
                  {entry.label}
                </MenuButton>
              ))}
            </>
          )}

          <div className="my-2 h-px bg-gradient-to-r from-transparent via-nutri-secondary/35 to-transparent" />

          <MenuButton active={Boolean(isSettingsActive)} onClick={openSettings} icon={Settings}>
            Configuración
          </MenuButton>

          <button
            onClick={onLogout}
            className="mx-2 my-1 flex w-[calc(100%-1rem)] items-center gap-2 rounded-xl border border-nutri-primary/20 bg-nutri-primary/10 px-4 py-2.5 text-left text-sm font-semibold text-nutri-primary transition-all duration-150 hover:bg-nutri-primary/15"
          >
            <LogOut size={16} />
            Cerrar sesión
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
  icon: Icon,
  active = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ElementType;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "nutri-menu-panel-button group mx-2 my-1 flex w-[calc(100%-1rem)] items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-all duration-150",
        active
          ? "nutri-menu-panel-button-active bg-[linear-gradient(135deg,#172A3A_0%,#567C8D_100%)] text-nutri-white shadow-[0_10px_18px_rgba(18,33,46,0.24)]"
          : "nutri-menu-panel-button-idle text-nutri-dark-grey hover:bg-white/75"
      )}
    >
      <span
        className={cn(
          "nutri-menu-button-icon inline-flex h-8 w-8 items-center justify-center rounded-lg border",
          active
            ? "nutri-menu-button-icon-active border-white/30 bg-white/10 text-white"
            : "nutri-menu-button-icon-idle border-nutri-light-grey bg-white text-nutri-primary group-hover:border-nutri-secondary/40"
        )}
      >
        <Icon size={16} />
      </span>
      <span className="flex-1">{children}</span>
      {active ? <span className="h-2 w-2 rounded-full bg-white/90" /> : null}
    </button>
  );
}
