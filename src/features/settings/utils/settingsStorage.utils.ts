import type {
  InterfacePreferences,
  UserSettingsStorage,
} from "../types/settings.types";

const STORAGE_PREFIX = "nutrisem-configuracion";
export const SETTINGS_UPDATED_EVENT = "nutrisem:settings-updated";

export const DEFAULT_PREFERENCES: InterfacePreferences = {
  modoVisual: "sistema",
  idioma: "es",
};

export const DEFAULT_USER_SETTINGS: UserSettingsStorage = {
  fotoPerfil: null,
  preferencias: DEFAULT_PREFERENCES,
};

export function buildUserSettingsKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function mergeUserSettings(
  base: UserSettingsStorage,
  override: Partial<UserSettingsStorage>
): UserSettingsStorage {
  return {
    ...base,
    ...override,
    preferencias: {
      ...base.preferencias,
      ...(override.preferencias ?? {}),
    },
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

export function readUserSettings(userId: string): UserSettingsStorage {
  if (typeof window === "undefined") return DEFAULT_USER_SETTINGS;

  const raw = window.localStorage.getItem(buildUserSettingsKey(userId));
  const parsed = safeParseJson<Partial<UserSettingsStorage>>(raw);
  if (!parsed) return DEFAULT_USER_SETTINGS;

  return mergeUserSettings(DEFAULT_USER_SETTINGS, parsed);
}

export function persistUserSettings(userId: string, settings: UserSettingsStorage): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(buildUserSettingsKey(userId), JSON.stringify(settings));
    window.dispatchEvent(
      new CustomEvent(SETTINGS_UPDATED_EVENT, {
        detail: { userId },
      })
    );
    return true;
  } catch (error) {
    console.error("No se pudo guardar la configuración de usuario:", error);
    return false;
  }
}
