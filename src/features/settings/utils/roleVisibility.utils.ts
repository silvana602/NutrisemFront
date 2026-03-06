import { UserRole } from "@/types/user";

const ROLE_VISIBILITY_STORAGE_KEY = "nutrisem_role_visibility_settings_v1";
export const ROLE_VISIBILITY_UPDATED_EVENT = "nutrisem:role-visibility-updated";

export type ManagedVisibilityRole = UserRole.clinician | UserRole.patient;

export type RoleVisibilityRoute = {
  href: string;
  label: string;
  matchExact?: boolean;
};

export type RoleVisibilitySettings = Record<ManagedVisibilityRole, Record<string, boolean>>;

export const ROLE_VISIBILITY_ROUTE_CATALOG: Record<ManagedVisibilityRole, readonly RoleVisibilityRoute[]> = {
  [UserRole.clinician]: [
    { href: "/dashboard/clinician", label: "Inicio", matchExact: true },
    { href: "/dashboard/clinician/patients", label: "Mis pacientes" },
    { href: "/dashboard/clinician/consultation", label: "Nueva consulta" },
    { href: "/dashboard/clinician/diagnosis", label: "Diagnósticos" },
    { href: "/dashboard/clinician/reports", label: "Reportes" },
  ],
  [UserRole.patient]: [
    { href: "/dashboard/patient", label: "Inicio", matchExact: true },
    { href: "/dashboard/patient/diagnosis", label: "Diagnósticos" },
    { href: "/dashboard/patient/recommendations", label: "Recomendaciones" },
    { href: "/dashboard/patient/progress", label: "Mi progreso" },
    { href: "/dashboard/patient/education", label: "Educación" },
  ],
};

function isRoleManaged(role: UserRole): role is ManagedVisibilityRole {
  return role === UserRole.clinician || role === UserRole.patient;
}

function createDefaultVisibilityMapForRole(role: ManagedVisibilityRole): Record<string, boolean> {
  return ROLE_VISIBILITY_ROUTE_CATALOG[role].reduce<Record<string, boolean>>((acc, route) => {
    acc[route.href] = true;
    return acc;
  }, {});
}

export function createDefaultRoleVisibilitySettings(): RoleVisibilitySettings {
  return {
    [UserRole.clinician]: createDefaultVisibilityMapForRole(UserRole.clinician),
    [UserRole.patient]: createDefaultVisibilityMapForRole(UserRole.patient),
  };
}

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function sanitizeRoleVisibilitySettings(raw: unknown): RoleVisibilitySettings {
  const defaults = createDefaultRoleVisibilitySettings();

  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  const source = raw as Partial<Record<ManagedVisibilityRole, Record<string, unknown>>>;
  const sanitized: RoleVisibilitySettings = {
    [UserRole.clinician]: { ...defaults[UserRole.clinician] },
    [UserRole.patient]: { ...defaults[UserRole.patient] },
  };

  const managedRoles: ManagedVisibilityRole[] = [UserRole.clinician, UserRole.patient];
  managedRoles.forEach((role) => {
    const roleSource = source[role];
    if (!roleSource || typeof roleSource !== "object") return;

    ROLE_VISIBILITY_ROUTE_CATALOG[role].forEach((route) => {
      const value = roleSource[route.href];
      if (typeof value === "boolean") {
        sanitized[role][route.href] = value;
      }
    });
  });

  return sanitized;
}

export function readRoleVisibilitySettings(): RoleVisibilitySettings {
  if (typeof window === "undefined") {
    return createDefaultRoleVisibilitySettings();
  }

  const raw = window.localStorage.getItem(ROLE_VISIBILITY_STORAGE_KEY);
  const parsed = safeParseJson<unknown>(raw);
  return sanitizeRoleVisibilitySettings(parsed);
}

export function persistRoleVisibilitySettings(settings: RoleVisibilitySettings): boolean {
  if (typeof window === "undefined") return false;

  const sanitized = sanitizeRoleVisibilitySettings(settings);

  try {
    window.localStorage.setItem(ROLE_VISIBILITY_STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent(ROLE_VISIBILITY_UPDATED_EVENT));
    return true;
  } catch (error) {
    console.error("No se pudo guardar la visibilidad de menús por rol:", error);
    return false;
  }
}

export function getRoleVisibilityRoutes(role: ManagedVisibilityRole): readonly RoleVisibilityRoute[] {
  return ROLE_VISIBILITY_ROUTE_CATALOG[role];
}

export function getManagedRoleLabel(role: ManagedVisibilityRole): string {
  if (role === UserRole.clinician) return "Salubrista";
  return "Paciente / Padre";
}

export function isMenuHrefVisibleForRole(
  role: UserRole,
  href: string,
  settings: RoleVisibilitySettings = readRoleVisibilitySettings()
): boolean {
  if (!isRoleManaged(role)) return true;
  return settings[role][href] ?? true;
}

function isPathWithinRoute(pathname: string, route: RoleVisibilityRoute): boolean {
  if (route.matchExact) return pathname === route.href;
  return pathname === route.href || pathname.startsWith(route.href + "/");
}

export function isPathVisibleForRole(
  role: UserRole,
  pathname: string,
  settings: RoleVisibilitySettings = readRoleVisibilitySettings()
): boolean {
  if (!isRoleManaged(role)) return true;

  const matchingRoute = ROLE_VISIBILITY_ROUTE_CATALOG[role]
    .slice()
    .sort((a, b) => b.href.length - a.href.length)
    .find((route) => isPathWithinRoute(pathname, route));

  if (!matchingRoute) return true;
  return settings[role][matchingRoute.href] ?? true;
}

export function resolveFallbackVisibleRouteForRole(
  role: UserRole,
  settings: RoleVisibilitySettings = readRoleVisibilitySettings()
): string {
  if (!isRoleManaged(role)) {
    if (role === UserRole.admin) return "/dashboard/admin";
    return "/";
  }

  const firstVisible = ROLE_VISIBILITY_ROUTE_CATALOG[role].find(
    (route) => settings[role][route.href] ?? true
  );

  return firstVisible?.href ?? ROLE_VISIBILITY_ROUTE_CATALOG[role][0]?.href ?? "/";
}
