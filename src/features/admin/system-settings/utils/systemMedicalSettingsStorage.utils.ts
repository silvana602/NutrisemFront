import type { Food } from "@/types";
import type {
  MedicalFoodCatalogItem,
  OmsPercentileAnchorSetting,
  RestrictionItem,
  SystemMedicalSettings,
  SystemMedicalSettingsDraft,
} from "../types";
import {
  createDefaultSystemMedicalSettings,
  getRecommendedFoodsFromCatalog,
  getRestrictedItemsFromCatalog,
  sanitizeSystemMedicalSettings,
} from "./systemMedicalSettings.utils";

const SYSTEM_MEDICAL_SETTINGS_STORAGE_KEY = "nutrisem_system_medical_settings_v1";

let runtimeSettingsCache: SystemMedicalSettings | null = null;

function readStoredSettingsRaw(): Partial<SystemMedicalSettings> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SYSTEM_MEDICAL_SETTINGS_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<SystemMedicalSettings>;
    return parsed;
  } catch (error) {
    console.warn("No se pudo leer la configuración médica del sistema:", error);
    return null;
  }
}

export function readSystemMedicalSettings(
  fallbackFoods: Food[]
): SystemMedicalSettings {
  if (runtimeSettingsCache) return runtimeSettingsCache;

  const raw = readStoredSettingsRaw();
  runtimeSettingsCache = sanitizeSystemMedicalSettings(raw, fallbackFoods);
  return runtimeSettingsCache;
}

export function persistSystemMedicalSettings(
  draft: SystemMedicalSettingsDraft,
  fallbackFoods: Food[]
): boolean {
  const settingsToPersist = sanitizeSystemMedicalSettings(
    {
      ...draft,
      updatedAt: new Date().toISOString(),
    },
    fallbackFoods
  );

  runtimeSettingsCache = settingsToPersist;

  if (typeof window === "undefined") return true;

  try {
    window.localStorage.setItem(
      SYSTEM_MEDICAL_SETTINGS_STORAGE_KEY,
      JSON.stringify(settingsToPersist)
    );
    return true;
  } catch (error) {
    console.warn("No se pudo guardar la configuración médica del sistema:", error);
    return false;
  }
}

export function resetSystemMedicalSettings(fallbackFoods: Food[]): SystemMedicalSettings {
  const defaults = createDefaultSystemMedicalSettings(fallbackFoods);
  runtimeSettingsCache = defaults;

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SYSTEM_MEDICAL_SETTINGS_STORAGE_KEY);
  }

  return defaults;
}

export function getConfiguredBloodPressureRanges(fallbackFoods: Food[]) {
  return readSystemMedicalSettings(fallbackFoods).bloodPressureRanges;
}

export function getConfiguredOmsPercentileAnchors(
  fallbackFoods: Food[]
): OmsPercentileAnchorSetting[] {
  return readSystemMedicalSettings(fallbackFoods).omsPercentileAnchors;
}

export function getConfiguredFoodCatalog(
  fallbackFoods: Food[]
): MedicalFoodCatalogItem[] {
  return readSystemMedicalSettings(fallbackFoods).foodCatalog;
}

export function getConfiguredRestrictedFoodItems(
  fallbackFoods: Food[]
): RestrictionItem[] {
  const catalog = getConfiguredFoodCatalog(fallbackFoods);
  return getRestrictedItemsFromCatalog(catalog);
}

export function getConfiguredRecommendedFoods(
  fallbackFoods: Food[]
): Food[] {
  const catalog = getConfiguredFoodCatalog(fallbackFoods);
  return getRecommendedFoodsFromCatalog(catalog, fallbackFoods);
}

export function applyConfiguredRecommendedFoodsToDb(
  foodsTarget: Food[],
  fallbackFoods: Food[]
) {
  const configuredFoods = getConfiguredRecommendedFoods(fallbackFoods);
  foodsTarget.splice(0, foodsTarget.length, ...configuredFoods);
}
