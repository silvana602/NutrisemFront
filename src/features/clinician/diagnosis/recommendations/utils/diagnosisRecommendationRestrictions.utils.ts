import { buildRestrictedFoodGroupsByNutritionalStatus } from "@/features/shared/nutrition";

export function getDiagnosisRestrictedFoodGroups(nutritionalStatus: string) {
  return buildRestrictedFoodGroupsByNutritionalStatus(nutritionalStatus);
}
