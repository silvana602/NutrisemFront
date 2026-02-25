import { UserRole } from "@/types/user";

export const DASHBOARD_PATH_BY_ROLE: Record<UserRole, string> = {
  [UserRole.admin]: "/dashboard/admin",
  [UserRole.clinician]: "/dashboard/clinician",
  [UserRole.patient]: "/dashboard/patient",
};

export const SETTINGS_PATH_BY_ROLE: Record<UserRole, string> = {
  [UserRole.admin]: "/dashboard/admin/settings",
  [UserRole.clinician]: "/dashboard/clinician/settings",
  [UserRole.patient]: "/dashboard/patient/settings",
};

export const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  [UserRole.admin]: [
    "/dashboard/admin",
    "/dashboard/admin/users",
    "/dashboard/admin/reports",
    "/dashboard/admin/histories",
    "/dashboard/admin/settings",
  ],
  [UserRole.clinician]: [
    "/dashboard/clinician",
    "/dashboard/clinician/patients",
    "/dashboard/clinician/consultation",
    "/dashboard/clinician/diagnosis",
    "/dashboard/clinician/reports",
    "/dashboard/clinician/settings",
  ],
  [UserRole.patient]: [
    "/dashboard/patient",
    "/dashboard/patient/progress",
    "/dashboard/patient/diagnosis",
    "/dashboard/patient/recommendations",
    "/dashboard/patient/settings",
  ],
};

export function resolveDashboardPathByRole(role: UserRole | null | undefined) {
  if (!role) return "/";
  return DASHBOARD_PATH_BY_ROLE[role] ?? "/";
}

export function resolveSettingsPathByRole(role: UserRole | null | undefined) {
  if (!role) return "/";
  return SETTINGS_PATH_BY_ROLE[role] ?? "/";
}

export function isRoleAllowedPath(role: UserRole, pathname: string) {
  const allowedRoutes = ROLE_ALLOWED_PREFIXES[role];
  return allowedRoutes.some((route) => pathname.startsWith(route));
}
