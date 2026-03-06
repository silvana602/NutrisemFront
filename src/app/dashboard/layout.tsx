"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/components/layout/sidebar/Sidebar";
import { LoadingButton } from "@/components/ui/Spinner";
import { UserRole } from "@/types/user";
import { cn } from "@/lib/utils";
import { db } from "@/mocks/db";
import {
  isPathVisibleForRole,
  resolveFallbackVisibleRouteForRole,
  ROLE_VISIBILITY_UPDATED_EVENT,
} from "@/features/settings/utils/roleVisibility.utils";
import {
  DEFAULT_PLATFORM_MAINTENANCE_STATE,
  PLATFORM_MAINTENANCE_UPDATED_EVENT,
  readPlatformMaintenanceState,
} from "@/features/settings/utils/platformMaintenance.utils";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

function getRouteRole(pathname: string): UserRole | null {
  const segments = pathname.split("/").filter(Boolean);
  const dashboardRole = segments[1];

  if (dashboardRole === UserRole.admin) return UserRole.admin;
  if (dashboardRole === UserRole.clinician) return UserRole.clinician;
  if (dashboardRole === UserRole.patient) return UserRole.patient;

  return null;
}

function canUserAccessRouteRole(
  user: { role: UserRole; userId: string },
  routeRole: UserRole | null
): boolean {
  if (!routeRole) return true;

  if (user.role === UserRole.admin) return true;

  if (user.role === UserRole.clinician) {
    if (routeRole === UserRole.clinician) return true;
    if (routeRole === UserRole.patient) {
      return db.patients.some((patient) => patient.userId === user.userId);
    }
    return false;
  }

  return routeRole === UserRole.patient;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hydrated, activeRole, setActiveRole } = useAuthStore();
  const [maintenanceState, setMaintenanceState] = useState(DEFAULT_PLATFORM_MAINTENANCE_STATE);
  const [visibilityVersion, setVisibilityVersion] = useState(0);
  const routeRole = getRouteRole(pathname ?? "");
  const routeBlockedByVisibility = Boolean(
    user &&
      routeRole &&
      user.role !== UserRole.admin &&
      !isPathVisibleForRole(routeRole, pathname ?? "")
  );
  const hasForbiddenRoute = Boolean(
    user && (!canUserAccessRouteRole(user, routeRole) || routeBlockedByVisibility)
  );

  useEffect(() => {
    const syncMaintenance = () => {
      setMaintenanceState(readPlatformMaintenanceState());
    };

    const syncVisibility = () => {
      setVisibilityVersion((version) => version + 1);
    };

    const onStorage = () => {
      syncMaintenance();
      syncVisibility();
    };

    syncMaintenance();
    window.addEventListener("storage", onStorage);
    window.addEventListener(ROLE_VISIBILITY_UPDATED_EVENT, syncVisibility);
    window.addEventListener(PLATFORM_MAINTENANCE_UPDATED_EVENT, syncMaintenance);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(ROLE_VISIBILITY_UPDATED_EVENT, syncVisibility);
      window.removeEventListener(PLATFORM_MAINTENANCE_UPDATED_EVENT, syncMaintenance);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      const pathWithQuery =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : pathname ?? "/dashboard";
      router.replace(`/401?next=${encodeURIComponent(pathWithQuery)}`);
      return;
    }

    if (!canUserAccessRouteRole(user, routeRole)) {
      router.replace("/403");
      return;
    }

    if (routeRole && user.role !== UserRole.admin && !isPathVisibleForRole(routeRole, pathname ?? "")) {
      const fallbackRoute = resolveFallbackVisibleRouteForRole(routeRole);
      if (fallbackRoute !== (pathname ?? "")) {
        router.replace(fallbackRoute);
      } else {
        router.replace("/403");
      }
      return;
    }

    if (routeRole && activeRole !== routeRole) {
      setActiveRole(routeRole);
    }
  }, [
    hydrated,
    user,
    routeRole,
    router,
    pathname,
    activeRole,
    setActiveRole,
    visibilityVersion,
  ]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] items-center justify-center">
        <LoadingButton loading>Cargando...</LoadingButton>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] items-center justify-center">
        <LoadingButton loading>Redirigiendo...</LoadingButton>
      </div>
    );
  }

  if (hasForbiddenRoute) {
    return (
      <div className="flex min-h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] items-center justify-center">
        <LoadingButton loading>Validando permisos...</LoadingButton>
      </div>
    );
  }

  if (maintenanceState.enabled && user.role !== UserRole.admin) {
    return (
      <div className="flex min-h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] items-center justify-center px-4">
        <div className="nutri-platform-surface w-full max-w-xl space-y-3 p-5 text-center">
          <h2 className="text-lg font-semibold text-nutri-primary">Plataforma en mantenimiento</h2>
          <p className="text-sm text-nutri-dark-grey/85">
            Estamos aplicando ajustes técnicos para mejorar la estabilidad del sistema. Intenta
            nuevamente en unos minutos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "nutri-platform-layout flex min-h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] items-start overflow-x-hidden lg:pl-64"
      )}
    >
      <Sidebar />

      <main className={cn("nutri-platform-main min-w-0 flex-1 px-2 py-3 sm:px-4 sm:py-5 lg:px-6")}>
        <div className={cn("mx-auto w-full max-w-[1460px]")}>
          {children}
        </div>
      </main>
    </div>
  );
}
