import type { RestrictedFoodGroup } from "@/features/shared/nutrition";

export type RecommendedFoodRow = {
  foodId: string;
  foodName: string;
  category: string;
  dailyAmount: string;
  referenceAge: string;
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbohydratesG: number;
  fiberG: number;
};

export type PatientRecommendationViewModel = {
  patientName: string;
  dateLabel: string;
  nutritionalStatus: string;
  medicalRecommendation: string;
  dietaryRecommendation: string;
  suggestedFoods: RecommendedFoodRow[];
  restrictedGroups: RestrictedFoodGroup[];
};
