export const PLATFORM_MAINTENANCE_UPDATED_EVENT = "nutrisem:platform-maintenance-updated";

const PLATFORM_MAINTENANCE_STORAGE_KEY = "nutrisem_platform_maintenance_v1";

export type PlatformMaintenanceState = {
  enabled: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
};

export const DEFAULT_PLATFORM_MAINTENANCE_STATE: PlatformMaintenanceState = {
  enabled: false,
  updatedAt: null,
  updatedBy: null,
};

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function sanitizePlatformMaintenanceState(raw: unknown): PlatformMaintenanceState {
  if (!raw || typeof raw !== "object") return DEFAULT_PLATFORM_MAINTENANCE_STATE;

  const source = raw as Partial<PlatformMaintenanceState>;
  return {
    enabled: Boolean(source.enabled),
    updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : null,
    updatedBy: typeof source.updatedBy === "string" ? source.updatedBy : null,
  };
}

export function readPlatformMaintenanceState(): PlatformMaintenanceState {
  if (typeof window === "undefined") return DEFAULT_PLATFORM_MAINTENANCE_STATE;

  const raw = window.localStorage.getItem(PLATFORM_MAINTENANCE_STORAGE_KEY);
  const parsed = safeParseJson<unknown>(raw);
  return sanitizePlatformMaintenanceState(parsed);
}

export function persistPlatformMaintenanceState(state: PlatformMaintenanceState): boolean {
  if (typeof window === "undefined") return false;

  const sanitized = sanitizePlatformMaintenanceState(state);
  try {
    window.localStorage.setItem(PLATFORM_MAINTENANCE_STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent(PLATFORM_MAINTENANCE_UPDATED_EVENT));
    return true;
  } catch (error) {
    console.error("No se pudo guardar el modo mantenimiento:", error);
    return false;
  }
}

export function togglePlatformMaintenance(
  enabled: boolean,
  updatedBy: string
): PlatformMaintenanceState {
  return {
    enabled,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
}
