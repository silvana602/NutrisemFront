"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import Avatar from "@/components/ui/Avatar";
import AlertDialog from "@/components/ui/AlertDialog";
import { Backdrop } from "@/components/ui/Backdrop";
import { Button } from "@/components/ui/Button";
import MobileToggle from "@/components/layout/sidebar/MobileToggle";
import UserMenu from "@/components/layout/sidebar/UserMenu";

import { getMenuByRole } from "@/config/menus";
import { useGlobalDismiss } from "@/hooks/useGlobalDismiss";
import { useDisclosure } from "@/hooks/useDisclosure";
import { cn } from "@/lib/utils";
import { db } from "@/mocks/db";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types/user";
import { logoutClient } from "@/lib/auth/client";
import {
  resolveDashboardPathByRole,
  resolveSettingsPathByRole,
} from "@/lib/auth/roleRouting";
import { useUserSettings } from "@/features/settings/hooks/useUserSettings";

function buildNext(pathname: string | null, qs: string): string | "" {
  if (!pathname) return "";
  if (pathname === "/login" || pathname === "/register") return "";
  const full = qs ? `${pathname}?${qs}` : pathname;
  return full;
}

function isItemActive(pathname: string | null, href: string, matchExact?: boolean) {
  if (!pathname) return false;
  if (matchExact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function roleLabel(role: UserRole | null): string {
  if (role === UserRole.admin) return "Admin";
  if (role === UserRole.clinician) return "Clínico";
  if (role === UserRole.patient) return "Paciente";
  return "Usuario";
}

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const clinician = useAuthStore((s) => s.clinician);
  const activeRole = useAuthStore((s) => s.activeRole);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const clearSession = useAuthStore((s) => s.clearSession);

  const nextFull = buildNext(pathname, "");
  const nextQuery = nextFull ? `?next=${encodeURIComponent(nextFull)}` : "";

  const mobile = useDisclosure(false);

  const mobileRef = useRef<HTMLDivElement | null>(null);
  const mobileBtnRef = useRef<HTMLButtonElement | null>(null);

  const [showPatientAlert, setShowPatientAlert] = useState(false);
  const [showClinicianAlert, setShowClinicianAlert] = useState(false);

  useGlobalDismiss([mobile.onClose], [mobileRef, mobileBtnRef]);

  const currentRole = activeRole ?? user?.role ?? null;
  const { fotoPerfil: profilePhoto } = useUserSettings(user?.userId ?? null);
  const menuItems = useMemo(() => {
    if (!currentRole) return [];
    return getMenuByRole(currentRole);
  }, [currentRole]);

  const canAccessPatientPanel = () =>
    user ? db.patients.some((p) => p.userId === user.userId) : false;

  const canAccessClinicianPanel = () => Boolean(clinician);

  const switchPanel = (role: UserRole) => {
    if (!user) return;

    if (role === UserRole.patient && !canAccessPatientPanel()) {
      setShowPatientAlert(true);
      return;
    }

    if (role === UserRole.clinician && !canAccessClinicianPanel()) {
      setShowClinicianAlert(true);
      return;
    }

    setActiveRole(role);
    mobile.onClose();
    router.push(resolveDashboardPathByRole(role));
  };

  const onLogout = async () => {
    await logoutClient(clearSession);
    mobile.onClose();
    router.replace("/");
  };

  const onOpenSettings = () => {
    if (!currentRole) return;
    mobile.onClose();
    router.push(resolveSettingsPathByRole(currentRole));
  };

  const isAdmin = user?.role === UserRole.admin;
  const isClinician = user?.role === UserRole.clinician;

  return (
    <header className="sticky top-0 z-40 h-[var(--nutri-navbar-height)] border-b border-white/60 bg-[linear-gradient(110deg,rgba(251,249,241,0.96)_0%,rgba(245,239,235,0.9)_45%,rgba(231,233,227,0.85)_100%)] shadow-[0_10px_30px_rgba(18,33,46,0.12)] backdrop-blur">
      <div className="mx-auto flex h-full w-full max-w-[1480px] px-3 sm:px-4 lg:px-6">
        <div className="flex w-full items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="Ir a la página de bienvenida"
            className="group flex min-w-0 items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-[linear-gradient(135deg,#172A3A_0%,#567C8D_100%)] text-lg font-bold text-nutri-white shadow-[0_10px_20px_rgba(18,33,46,0.28)] transition-transform group-hover:-translate-y-0.5">
              N
            </div>
            <div className="min-w-0">
              <span className="hidden truncate text-xl font-extrabold tracking-tight text-nutri-primary sm:block sm:text-[1.45rem]">
                Nutrisem
              </span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-nutri-dark-grey/70 lg:block">
                Seguimiento nutricional
              </span>
            </div>
          </Link>

          {user && (
            <div className="ml-auto md:hidden">
              <MobileToggle
                ref={mobileBtnRef}
                open={mobile.open}
                onToggle={mobile.onToggle}
                menuId="navbar-mobile-menu"
              />
            </div>
          )}

          {user ? (
            <div className="hidden md:block">
              <div className="rounded-2xl border border-white/70 bg-white/65 p-1 shadow-[0_8px_18px_rgba(18,33,46,0.1)]">
                <UserMenu />
              </div>
            </div>
          ) : pathname !== "/login" ? (
            <Button
              variant="outline"
              className="border-nutri-primary/25 bg-white/70 px-4 py-2 text-sm font-bold text-nutri-primary hover:bg-white sm:px-5 sm:py-2.5"
            >
              <Link href={`/login${nextQuery}`}>Iniciar sesión</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <Backdrop show={mobile.open} onClick={mobile.onClose} mobileOnly />

      {user && mobile.open && (
        <div
          id="navbar-mobile-menu"
          ref={mobileRef}
          className="fixed inset-x-0 top-[var(--nutri-navbar-height)] z-50 md:hidden"
        >
          <div className="mx-3 mt-3 max-h-[calc(100dvh-var(--nutri-navbar-height)-1rem)] overflow-y-auto rounded-2xl border border-white/80 bg-[linear-gradient(160deg,rgba(251,249,241,0.97)_0%,rgba(245,239,235,0.92)_75%,rgba(231,233,227,0.9)_100%)] p-3 shadow-[0_24px_40px_rgba(18,33,46,0.3)]">
            <div className="rounded-xl border border-white/85 bg-white/65 p-3 shadow-[0_10px_22px_rgba(18,33,46,0.1)]">
              <div className="flex items-center gap-3">
                <Avatar name={`${user.firstName} ${user.lastName}`} src={profilePhoto} size={44} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-nutri-black">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-xs text-nutri-dark-grey">C.I. {user.identityNumber}</p>
                </div>
                <span className="ml-auto inline-flex rounded-full border border-nutri-secondary/30 bg-nutri-secondary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-nutri-primary">
                  {roleLabel(currentRole)}
                </span>
              </div>
            </div>

            <div className="my-3 h-px bg-gradient-to-r from-transparent via-nutri-secondary/35 to-transparent" />

            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-nutri-secondary">
              Navegación
            </p>
            <nav className="mt-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(pathname, item.href, item.matchExact);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={mobile.onClose}
                    className={cn(
                      "nutri-menu-button group my-1.5 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all",
                      active
                        ? "nutri-menu-button-active bg-[linear-gradient(135deg,#172A3A_0%,#567C8D_100%)] text-nutri-white shadow-[0_10px_20px_rgba(18,33,46,0.24)]"
                        : "nutri-menu-button-idle text-nutri-dark-grey hover:bg-white/75"
                    )}
                  >
                    <span
                      className={cn(
                        "nutri-menu-button-icon inline-flex h-8 w-8 items-center justify-center rounded-lg border",
                        active
                          ? "nutri-menu-button-icon-active border-white/30 bg-white/15"
                          : "nutri-menu-button-icon-idle border-nutri-light-grey bg-white text-nutri-primary"
                      )}
                    >
                      <Icon size={16} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="my-3 h-px bg-gradient-to-r from-transparent via-nutri-secondary/35 to-transparent" />

            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-nutri-secondary">
              Usuario
            </p>

            <div className="mt-2 space-y-1">
              {isAdmin && (
                <>
                  <button
                    onClick={() => switchPanel(UserRole.admin)}
                    className={cn(
                      "nutri-menu-panel-button block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all",
                      currentRole === UserRole.admin
                        ? "nutri-menu-panel-button-active bg-nutri-primary text-nutri-white"
                        : "nutri-menu-panel-button-idle text-nutri-dark-grey hover:bg-white/75"
                    )}
                  >
                    Panel de Administración
                  </button>

                  <button
                    onClick={() => switchPanel(UserRole.clinician)}
                    className={cn(
                      "nutri-menu-panel-button block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all",
                      currentRole === UserRole.clinician
                        ? "nutri-menu-panel-button-active bg-nutri-primary text-nutri-white"
                        : "nutri-menu-panel-button-idle text-nutri-dark-grey hover:bg-white/75"
                    )}
                  >
                    Panel del Salubrista
                  </button>

                  <button
                    onClick={() => switchPanel(UserRole.patient)}
                    className={cn(
                      "nutri-menu-panel-button block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all",
                      currentRole === UserRole.patient
                        ? "nutri-menu-panel-button-active bg-nutri-primary text-nutri-white"
                        : "nutri-menu-panel-button-idle text-nutri-dark-grey hover:bg-white/75"
                    )}
                  >
                    Panel de Paciente
                  </button>
                </>
              )}

              {isClinician && (
                <>
                  <button
                    onClick={() => switchPanel(UserRole.clinician)}
                    className={cn(
                      "nutri-menu-panel-button block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all",
                      currentRole === UserRole.clinician
                        ? "nutri-menu-panel-button-active bg-nutri-primary text-nutri-white"
                        : "nutri-menu-panel-button-idle text-nutri-dark-grey hover:bg-white/75"
                    )}
                  >
                    Mi Panel Profesional
                  </button>

                  <button
                    onClick={() => switchPanel(UserRole.patient)}
                    className={cn(
                      "nutri-menu-panel-button block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all",
                      currentRole === UserRole.patient
                        ? "nutri-menu-panel-button-active bg-nutri-primary text-nutri-white"
                        : "nutri-menu-panel-button-idle text-nutri-dark-grey hover:bg-white/75"
                    )}
                  >
                    Mi Panel Personal
                  </button>
                </>
              )}
            </div>

            <button
              onClick={onOpenSettings}
              className={cn(
                "nutri-menu-panel-button mt-2 w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-all",
                pathname?.includes("/settings")
                  ? "nutri-menu-panel-button-active bg-nutri-primary text-nutri-white"
                  : "nutri-menu-panel-button-idle text-nutri-dark-grey hover:bg-white/75"
              )}
            >
              Configuración
            </button>

            <button
              onClick={onLogout}
              className="mt-3 w-full rounded-xl border border-nutri-primary/20 bg-nutri-primary/10 px-4 py-2.5 text-left text-sm font-semibold text-nutri-primary transition-all hover:bg-nutri-primary/15"
            >
              Cerrar sesión
            </button>
          </div>
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
    </header>
  );
};
