import {
  buildRestrictedFoodGroupsByNutritionalStatus,
  type RestrictedFoodItem,
} from "@/features/shared/nutrition";

export function getDiagnosisRestrictedFoodGroups(
  nutritionalStatus: string,
  customRestrictedItems: RestrictedFoodItem[] = []
) {
  return buildRestrictedFoodGroupsByNutritionalStatus(
    nutritionalStatus,
    customRestrictedItems
  );
}
