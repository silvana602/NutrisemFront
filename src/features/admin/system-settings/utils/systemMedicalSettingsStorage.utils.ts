import type { Food, ResidenceLocation } from "@/types";
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

function normalizeLocationText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isLargeMarketProvince(
  settings: SystemMedicalSettings,
  province: string | null | undefined
) {
  const normalized = normalizeLocationText(province ?? "");
  if (!normalized) return false;
  return settings.largeMarketProvinces.some(
    (item) => normalizeLocationText(item) === normalized
  );
}

function matchesLocation(
  itemLocation: MedicalFoodCatalogItem["location"] | undefined,
  location: Partial<ResidenceLocation> | null | undefined
) {
  if (!itemLocation) return true; // nacional
  if (!location) return false;

  const dep = normalizeLocationText(itemLocation.department ?? "");
  const prov = normalizeLocationText(itemLocation.province ?? "");
  const mun = normalizeLocationText(itemLocation.municipality ?? "");

  const lDep = normalizeLocationText(location.department ?? "");
  const lProv = normalizeLocationText(location.province ?? "");
  const lMun = normalizeLocationText(location.municipality ?? "");

  if (dep && dep !== lDep) return false;
  if (prov && prov !== lProv) return false;
  if (mun && mun !== lMun) return false;
  return true;
}

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
  fallbackFoods: Food[],
  location?: Partial<ResidenceLocation> | null
): RestrictionItem[] {
  const settings = readSystemMedicalSettings(fallbackFoods);
  const catalog = isLargeMarketProvince(settings, location?.province)
    ? settings.foodCatalog
    : settings.foodCatalog.filter((item) => matchesLocation(item.location, location));
  return getRestrictedItemsFromCatalog(catalog);
}

export function getConfiguredRecommendedFoods(
  fallbackFoods: Food[],
  location?: Partial<ResidenceLocation> | null
): Food[] {
  const settings = readSystemMedicalSettings(fallbackFoods);
  const catalog = isLargeMarketProvince(settings, location?.province)
    ? settings.foodCatalog
    : settings.foodCatalog.filter((item) => matchesLocation(item.location, location));
  return getRecommendedFoodsFromCatalog(catalog, fallbackFoods);
}

export function applyConfiguredRecommendedFoodsToDb(
  foodsTarget: Food[],
  fallbackFoods: Food[]
) {
  const configuredFoods = getConfiguredRecommendedFoods(fallbackFoods);
  foodsTarget.splice(0, foodsTarget.length, ...configuredFoods);
}
