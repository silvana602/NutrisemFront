import type { Food } from "@/types";

export type NumericRange = {
  min: number;
  max: number;
};

export type BloodPressureRangeSetting = {
  id: string;
  ageGroup: string;
  fromMonths: number;
  toMonths: number;
  systolic: NumericRange;
  diastolic: NumericRange;
};

export type OmsPercentileAnchorKey = "p3" | "p15" | "p50" | "p85" | "p97";

export type OmsPercentileAnchorSetting = {
  key: OmsPercentileAnchorKey;
  label: string;
  percentile: number;
  zScore: number;
};

export type MedicalFoodType = "recomendado" | "restringido";

export type MedicalFoodCatalogItem = {
  id: string;
  name: string;
  category: string;
  type: MedicalFoodType;
  healthySubstitute: string;
  active: boolean;
};

export type SystemMedicalSettings = {
  bloodPressureRanges: BloodPressureRangeSetting[];
  omsPercentileAnchors: OmsPercentileAnchorSetting[];
  foodCatalog: MedicalFoodCatalogItem[];
  updatedAt: string;
};

export type SystemMedicalSettingsDraft = Omit<SystemMedicalSettings, "updatedAt">;

export type ResolvedBloodPressureRange = {
  ageGroup: string;
  systolic: NumericRange;
  diastolic: NumericRange;
};

export type RestrictionItem = {
  food: string;
  healthySubstitute: string;
};

export type RecommendedFoodDraft = Pick<
  Food,
  "foodName" | "category" | "energyKcal" | "proteinG" | "fatG" | "carbohydratesG" | "fiberG" | "vitamins" | "minerals"
>;
