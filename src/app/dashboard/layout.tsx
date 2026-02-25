"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/components/layout/sidebar/Sidebar";
import { LoadingButton } from "@/components/ui/Spinner";
import { UserRole } from "@/types/user";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function getRouteRole(pathname: string): UserRole | null {
  const segments = pathname.split("/").filter(Boolean);
  const dashboardRole = segments[1];

  if (dashboardRole === UserRole.admin) return UserRole.admin;
  if (dashboardRole === UserRole.clinician) return UserRole.clinician;
  if (dashboardRole === UserRole.patient) return UserRole.patient;

  return null;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hydrated } = useAuthStore();
  const routeRole = getRouteRole(pathname ?? "");
  const hasRoleMismatch = Boolean(user && routeRole && user.role !== routeRole);

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

    if (routeRole && user.role !== routeRole) {
      router.replace("/403");
    }
  }, [hydrated, user, routeRole, router, pathname]);

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

  if (hasRoleMismatch) {
    return (
      <div className="flex min-h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] items-center justify-center">
        <LoadingButton loading>Validando permisos...</LoadingButton>
      </div>
    );
  }

  return (
    <div className={cn("nutri-platform-layout flex min-h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] items-start")}>
      <Sidebar />

      <main className={cn("nutri-platform-main min-w-0 flex-1 px-2 py-3 sm:px-4 sm:py-5 lg:px-6")}>
        <div className={cn("mx-auto w-full max-w-[1460px]")}>
          {children}
        </div>
      </main>
    </div>
  );
}
