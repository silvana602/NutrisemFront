"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/components/layout/sidebar/Sidebar";
import { LoadingButton } from "@/components/ui/Spinner";
import { UserRole } from "@/types/user";

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
  const searchParams = useSearchParams();
  const { user, hydrated } = useAuthStore();

  const search = searchParams?.toString() ?? "";
  const pathWithQuery = pathname
    ? `${pathname}${search ? `?${search}` : ""}`
    : "/dashboard";
  const routeRole = getRouteRole(pathname ?? "");
  const hasRoleMismatch = Boolean(user && routeRole && user.role !== routeRole);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      router.replace(`/401?next=${encodeURIComponent(pathWithQuery)}`);
      return;
    }

    if (routeRole && user.role !== routeRole) {
      router.replace("/403");
    }
  }, [hydrated, user, routeRole, router, pathWithQuery]);

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
    <div className="flex min-h-[calc(100dvh-var(--nutri-navbar-height)-var(--nutri-footer-height))] items-start">
      <Sidebar />

      <main className="min-w-0 flex-1 p-3 sm:p-4">
        <div className="mx-auto w-full max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
