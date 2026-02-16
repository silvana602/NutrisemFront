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
  const menuItems = useMemo(() => {
    if (!currentRole) return [];
    return getMenuByRole(currentRole);
  }, [currentRole]);

  const canAccessPatientPanel = () =>
    user ? db.patients.some((p) => p.userId === user.userId) : false;

  const canAccessClinicianPanel = () => Boolean(clinician);

  const switchPanel = (role: UserRole, path: string) => {
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
    router.push(path);
  };

  const onLogout = () => {
    clearSession();
    mobile.onClose();
    router.replace("/");
  };

  const isAdmin = user?.role === UserRole.admin;
  const isClinician = user?.role === UserRole.clinician;

  return (
    <header className="sticky top-0 z-30 h-[var(--nutri-navbar-height)] border-b border-nutri-light-grey bg-nutri-white/95 shadow-sm">
      <div className="container mx-auto flex h-full px-3 sm:px-4">
        <div className="flex w-full items-center justify-between">
          <Link
            href="/"
            aria-label="Ir a la pagina de bienvenida"
            className="flex min-w-0 items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nutri-primary text-lg font-bold text-nutri-white sm:h-10 sm:w-10 sm:text-xl">
              N
            </div>
            <span className="hidden truncate text-xl font-bold text-nutri-primary sm:inline sm:text-2xl">
              Nutrisem
            </span>
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
              <UserMenu />
            </div>
          ) : (
            <Button variant="outline" className="px-3 py-2 text-sm sm:px-5 sm:py-2.5">
              <Link href={`/login${nextQuery}`}>Iniciar sesion</Link>
            </Button>
          )}
        </div>
      </div>

      <Backdrop show={mobile.open} onClick={mobile.onClose} mobileOnly />

      {user && mobile.open && (
        <div
          id="navbar-mobile-menu"
          ref={mobileRef}
          className="fixed inset-x-0 top-[var(--nutri-navbar-height)] z-50 md:hidden"
        >
          <div className="mx-3 mt-3 max-h-[calc(100dvh-var(--nutri-navbar-height)-1rem)] overflow-y-auto rounded-2xl border border-nutri-light-grey bg-nutri-white p-3 shadow-2xl">
            <div className="flex items-center gap-3 rounded-xl bg-nutri-off-white p-3">
              <Avatar name={`${user.firstName} ${user.lastName}`} size={42} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-nutri-black">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-xs text-nutri-dark-grey">
                  C.I. {user.identityNumber}
                </p>
              </div>
            </div>

            <div className="my-3 h-px bg-nutri-light-grey" />

            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-nutri-secondary">
              Navegacion
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
                      "my-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                      active
                        ? "bg-nutri-primary text-nutri-white"
                        : "text-nutri-dark-grey hover:bg-nutri-off-white"
                    )}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="my-3 h-px bg-nutri-light-grey" />

            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-nutri-secondary">
              Usuario
            </p>

            <div className="mt-2 space-y-1">
              {isAdmin && (
                <>
                  <button
                    onClick={() => switchPanel(UserRole.admin, "/dashboard/admin")}
                    className={cn(
                      "block w-full rounded-lg px-4 py-2 text-left text-sm transition-colors",
                      currentRole === UserRole.admin
                        ? "bg-nutri-primary text-nutri-white"
                        : "text-nutri-dark-grey hover:bg-nutri-off-white"
                    )}
                  >
                    Panel de Administracion
                  </button>

                  <button
                    onClick={() => switchPanel(UserRole.clinician, "/dashboard/clinician")}
                    className={cn(
                      "block w-full rounded-lg px-4 py-2 text-left text-sm transition-colors",
                      currentRole === UserRole.clinician
                        ? "bg-nutri-primary text-nutri-white"
                        : "text-nutri-dark-grey hover:bg-nutri-off-white"
                    )}
                  >
                    Panel del Salubrista
                  </button>

                  <button
                    onClick={() => switchPanel(UserRole.patient, "/dashboard/patient")}
                    className={cn(
                      "block w-full rounded-lg px-4 py-2 text-left text-sm transition-colors",
                      currentRole === UserRole.patient
                        ? "bg-nutri-primary text-nutri-white"
                        : "text-nutri-dark-grey hover:bg-nutri-off-white"
                    )}
                  >
                    Panel de Paciente
                  </button>
                </>
              )}

              {isClinician && (
                <>
                  <button
                    onClick={() => switchPanel(UserRole.clinician, "/dashboard/clinician")}
                    className={cn(
                      "block w-full rounded-lg px-4 py-2 text-left text-sm transition-colors",
                      currentRole === UserRole.clinician
                        ? "bg-nutri-primary text-nutri-white"
                        : "text-nutri-dark-grey hover:bg-nutri-off-white"
                    )}
                  >
                    Mi Panel Profesional
                  </button>

                  <button
                    onClick={() => switchPanel(UserRole.patient, "/dashboard/patient")}
                    className={cn(
                      "block w-full rounded-lg px-4 py-2 text-left text-sm transition-colors",
                      currentRole === UserRole.patient
                        ? "bg-nutri-primary text-nutri-white"
                        : "text-nutri-dark-grey hover:bg-nutri-off-white"
                    )}
                  >
                    Mi Panel Personal
                  </button>
                </>
              )}
            </div>

            <button
              onClick={onLogout}
              className="mt-3 w-full rounded-xl border border-nutri-primary/20 bg-nutri-primary/5 px-4 py-2.5 text-left text-sm font-semibold text-nutri-primary transition-all hover:bg-nutri-primary/10"
            >
              Cerrar sesion
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
