import type { Food } from "@/types";
import type {
  BloodPressureRangeSetting,
  MedicalFoodCatalogItem,
  OmsPercentileAnchorSetting,
  RecommendedFoodDraft,
  ResolvedBloodPressureRange,
  RestrictionItem,
  SystemMedicalSettings,
  SystemMedicalSettingsDraft,
} from "../types";

const DEFAULT_BLOOD_PRESSURE_RANGES: BloodPressureRangeSetting[] = [
  {
    id: "bp-newborn",
    ageGroup: "Recién nacido (0-28 días)",
    fromMonths: 0,
    toMonths: 0,
    systolic: { min: 60, max: 90 },
    diastolic: { min: 20, max: 60 },
  },
  {
    id: "bp-infant",
    ageGroup: "Lactante (1-12 meses)",
    fromMonths: 1,
    toMonths: 12,
    systolic: { min: 87, max: 105 },
    diastolic: { min: 53, max: 66 },
  },
  {
    id: "bp-toddler",
    ageGroup: "Niño pequeño (1-5 años)",
    fromMonths: 13,
    toMonths: 71,
    systolic: { min: 95, max: 110 },
    diastolic: { min: 53, max: 73 },
  },
  {
    id: "bp-school",
    ageGroup: "Escolar (6-12 años)",
    fromMonths: 72,
    toMonths: 144,
    systolic: { min: 97, max: 120 },
    diastolic: { min: 57, max: 80 },
  },
  {
    id: "bp-teen",
    ageGroup: "Adolescente (13-18 años)",
    fromMonths: 145,
    toMonths: 216,
    systolic: { min: 110, max: 131 },
    diastolic: { min: 64, max: 83 },
  },
];

const DEFAULT_OMS_PERCENTILE_ANCHORS: OmsPercentileAnchorSetting[] = [
  { key: "p3", label: "P3", percentile: 3, zScore: -2 },
  { key: "p15", label: "P15", percentile: 15, zScore: -1 },
  { key: "p50", label: "P50", percentile: 50, zScore: 0 },
  { key: "p85", label: "P85", percentile: 85, zScore: 1 },
  { key: "p97", label: "P97", percentile: 97, zScore: 2 },
];

const DEFAULT_RESTRICTED_FOOD_CATALOG: MedicalFoodCatalogItem[] = [
  {
    id: "rst-azucaradas",
    name: "Bebidas azucaradas",
    category: "Bebidas",
    type: "restringido",
    healthySubstitute: "Agua natural o infusiones sin azúcar",
    active: true,
  },
  {
    id: "rst-ultraprocesados",
    name: "Snacks ultraprocesados",
    category: "Snacks",
    type: "restringido",
    healthySubstitute: "Frutos secos o fruta fresca",
    active: true,
  },
  {
    id: "rst-frituras",
    name: "Frituras frecuentes",
    category: "Comidas",
    type: "restringido",
    healthySubstitute: "Preparaciones al horno o al vapor",
    active: true,
  },
];

const DEFAULT_FOOD_NUTRIENTS: RecommendedFoodDraft = {
  foodName: "",
  category: "",
  energyKcal: 0,
  proteinG: 0,
  fatG: 0,
  carbohydratesG: 0,
  fiberG: 0,
  vitamins: "",
  minerals: "",
};

function normalizeText(value: string): string {
  return value.trim();
}

function normalizeId(value: string): string {
  const normalized = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalized || `item-${Date.now()}`;
}

function parseNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const casted = Number(value);
  return Number.isFinite(casted) ? casted : fallback;
}

function sanitizeRange(minValue: unknown, maxValue: unknown) {
  const min = parseNumber(minValue, 0);
  const max = parseNumber(maxValue, min);
  return max >= min ? { min, max } : { min: max, max: min };
}

export function buildFoodCatalogFromFoods(
  foods: Food[]
): MedicalFoodCatalogItem[] {
  const catalogMap = new Map<string, MedicalFoodCatalogItem>();

  foods.forEach((food) => {
    const key = normalizeId(food.foodId || food.foodName);
    catalogMap.set(key, {
      id: key,
      name: normalizeText(food.foodName),
      category: normalizeText(food.category || "Sin categoría"),
      type: "recomendado",
      healthySubstitute: "",
      active: true,
    });
  });

  DEFAULT_RESTRICTED_FOOD_CATALOG.forEach((item) => {
    if (catalogMap.has(item.id)) return;
    catalogMap.set(item.id, item);
  });

  return [...catalogMap.values()];
}

export function createDefaultSystemMedicalSettings(
  foods: Food[]
): SystemMedicalSettings {
  return {
    bloodPressureRanges: DEFAULT_BLOOD_PRESSURE_RANGES.map((item) => ({ ...item })),
    omsPercentileAnchors: DEFAULT_OMS_PERCENTILE_ANCHORS.map((item) => ({ ...item })),
    foodCatalog: buildFoodCatalogFromFoods(foods),
    updatedAt: new Date().toISOString(),
  };
}

function sanitizeBloodPressureRanges(
  ranges: BloodPressureRangeSetting[] | undefined
): BloodPressureRangeSetting[] {
  if (!Array.isArray(ranges) || ranges.length === 0) {
    return DEFAULT_BLOOD_PRESSURE_RANGES.map((item) => ({ ...item }));
  }

  return ranges
    .map((item, index) => {
      const systolic = sanitizeRange(item?.systolic?.min, item?.systolic?.max);
      const diastolic = sanitizeRange(item?.diastolic?.min, item?.diastolic?.max);

      return {
        id: normalizeId(item?.id ?? `bp-${index + 1}`),
        ageGroup: normalizeText(item?.ageGroup ?? `Rango ${index + 1}`),
        fromMonths: Math.max(0, Math.floor(parseNumber(item?.fromMonths, 0))),
        toMonths: Math.max(0, Math.floor(parseNumber(item?.toMonths, 0))),
        systolic,
        diastolic,
      } satisfies BloodPressureRangeSetting;
    })
    .sort((first, second) => first.fromMonths - second.fromMonths);
}

function sanitizeOmsAnchors(
  anchors: OmsPercentileAnchorSetting[] | undefined
): OmsPercentileAnchorSetting[] {
  const fallbackByKey = new Map(
    DEFAULT_OMS_PERCENTILE_ANCHORS.map((anchor) => [anchor.key, anchor] as const)
  );

  if (!Array.isArray(anchors) || anchors.length === 0) {
    return DEFAULT_OMS_PERCENTILE_ANCHORS.map((item) => ({ ...item }));
  }

  const sanitized = anchors
    .map((anchor) => {
      const fallback = fallbackByKey.get(anchor.key);
      if (!fallback) return null;

      return {
        key: fallback.key,
        label: fallback.label,
        percentile: parseNumber(anchor.percentile, fallback.percentile),
        zScore: parseNumber(anchor.zScore, fallback.zScore),
      } satisfies OmsPercentileAnchorSetting;
    })
    .filter((anchor): anchor is OmsPercentileAnchorSetting => anchor !== null);

  if (sanitized.length !== DEFAULT_OMS_PERCENTILE_ANCHORS.length) {
    return DEFAULT_OMS_PERCENTILE_ANCHORS.map((item) => ({ ...item }));
  }

  return sanitized.sort((first, second) => first.percentile - second.percentile);
}

function sanitizeFoodCatalog(
  catalog: MedicalFoodCatalogItem[] | undefined
): MedicalFoodCatalogItem[] {
  if (!Array.isArray(catalog)) return [];

  const map = new Map<string, MedicalFoodCatalogItem>();
  catalog.forEach((item, index) => {
    const name = normalizeText(item?.name ?? "");
    if (!name) return;

    const id = normalizeId(item?.id ?? `${item?.type ?? "item"}-${index + 1}-${name}`);
    map.set(id, {
      id,
      name,
      category: normalizeText(item?.category ?? "Sin categoría"),
      type: item?.type === "restringido" ? "restringido" : "recomendado",
      healthySubstitute: normalizeText(item?.healthySubstitute ?? ""),
      active: item?.active !== false,
    });
  });

  return [...map.values()];
}

export function sanitizeSystemMedicalSettings(
  input: Partial<SystemMedicalSettings> | null | undefined,
  fallbackFoods: Food[]
): SystemMedicalSettings {
  const defaults = createDefaultSystemMedicalSettings(fallbackFoods);

  const sanitizedFoodCatalog = sanitizeFoodCatalog(input?.foodCatalog);
  const mergedFoodCatalog =
    sanitizedFoodCatalog.length > 0 ? sanitizedFoodCatalog : defaults.foodCatalog;

  return {
    bloodPressureRanges: sanitizeBloodPressureRanges(input?.bloodPressureRanges),
    omsPercentileAnchors: sanitizeOmsAnchors(input?.omsPercentileAnchors),
    foodCatalog: mergedFoodCatalog,
    updatedAt: input?.updatedAt ?? defaults.updatedAt,
  };
}

export function resolveBloodPressureRangeByAgeMonths(
  ranges: BloodPressureRangeSetting[],
  ageMonths: number | null
): ResolvedBloodPressureRange {
  if (ageMonths === null) {
    const fallback = ranges[0] ?? DEFAULT_BLOOD_PRESSURE_RANGES[0];
    return {
      ageGroup: fallback.ageGroup,
      systolic: fallback.systolic,
      diastolic: fallback.diastolic,
    };
  }

  const match =
    ranges.find((range) => ageMonths >= range.fromMonths && ageMonths <= range.toMonths) ??
    DEFAULT_BLOOD_PRESSURE_RANGES.find(
      (range) => ageMonths >= range.fromMonths && ageMonths <= range.toMonths
    ) ??
    DEFAULT_BLOOD_PRESSURE_RANGES[DEFAULT_BLOOD_PRESSURE_RANGES.length - 1];

  return {
    ageGroup: match.ageGroup,
    systolic: match.systolic,
    diastolic: match.diastolic,
  };
}

export function getRestrictedItemsFromCatalog(
  catalog: MedicalFoodCatalogItem[]
): RestrictionItem[] {
  return catalog
    .filter((item) => item.active && item.type === "restringido")
    .map((item) => ({
      food: item.name,
      healthySubstitute: item.healthySubstitute || "Sustituir por una opción natural.",
    }));
}

export function getRecommendedFoodsFromCatalog(
  catalog: MedicalFoodCatalogItem[],
  existingFoods: Food[]
): Food[] {
  const existingByName = new Map(
    existingFoods.map((food) => [food.foodName.trim().toLowerCase(), food] as const)
  );

  return catalog
    .filter((item) => item.active && item.type === "recomendado")
    .map((item, index) => {
      const existing = existingByName.get(item.name.trim().toLowerCase()) ?? null;
      if (existing) {
        return {
          ...existing,
          category: item.category || existing.category,
        } satisfies Food;
      }

      return {
        ...DEFAULT_FOOD_NUTRIENTS,
        foodId: `cfg-food-${normalizeId(item.id || item.name || String(index + 1))}`,
        foodName: item.name,
        category: item.category || "Sin categoría",
      } satisfies Food;
    });
}

export function toSystemMedicalSettingsDraft(
  settings: SystemMedicalSettings
): SystemMedicalSettingsDraft {
  return {
    bloodPressureRanges: settings.bloodPressureRanges.map((item) => ({
      ...item,
      systolic: { ...item.systolic },
      diastolic: { ...item.diastolic },
    })),
    omsPercentileAnchors: settings.omsPercentileAnchors.map((anchor) => ({ ...anchor })),
    foodCatalog: settings.foodCatalog.map((item) => ({ ...item })),
  };
}
