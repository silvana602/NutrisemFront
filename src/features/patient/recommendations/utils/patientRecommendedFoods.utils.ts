import type { Food, RecommendationFood } from "@/types";

import type { RecommendedFoodRow } from "../types";
import {
  deriveFoodBenefits,
  formatCategoryLabel,
  inferTimesPerDay,
  translatePortionText,
} from "./patientRecommendationsFormatting.utils";

export function buildPatientRecommendedFoodRows(
  recommendationId: string | null,
  recommendationFoods: RecommendationFood[],
  foods: Food[]
): RecommendedFoodRow[] {
  if (!recommendationId) return [];

  const foodById = new Map(foods.map((item) => [item.foodId, item] as const));

  return recommendationFoods
    .filter((item) => item.recommendationId === recommendationId)
    .map((item) => {
      const food = foodById.get(item.foodId);
      if (!food) return null;

      const translatedCategory = formatCategoryLabel(food.category);

      return {
        foodId: food.foodId,
        foodName: food.foodName,
        category: translatedCategory,
        portion: translatePortionText(item.dailyAmount),
        frequency: inferTimesPerDay(item.dailyAmount),
        benefits: deriveFoodBenefits(food, translatedCategory),
        imageAlt: `Imagen referencial de ${food.foodName}`,
        referenceAge: item.referenceAge,
      };
    })
    .filter((item): item is RecommendedFoodRow => item !== null);
}
