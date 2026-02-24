import type { RestrictedFoodGroup } from "@/features/shared/nutrition";

export type RecommendedFoodRow = {
  foodId: string;
  foodName: string;
  category: string;
  portion: string;
  frequency: string;
  benefits: string;
  imageAlt: string;
  referenceAge: string;
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
