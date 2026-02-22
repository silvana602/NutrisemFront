"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { db, seedOnce } from "@/mocks/db";

import {
  PatientRecommendedFoodsTable,
  PatientRecommendationsEmptyState,
  PatientRecommendationsHero,
  PatientRecommendationsSummary,
  PatientRestrictedFoodsList,
} from "@/features/patient/recommendations/components";
import { buildPatientRecommendationViewModel } from "@/features/patient/recommendations/utils";

seedOnce();

export default function PatientRecommendationsPage() {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  const viewModel = buildPatientRecommendationViewModel({
    userId: user.userId,
    users: db.users,
    patients: db.patients,
    consultations: db.consultations,
    diagnoses: db.diagnoses,
    recommendations: db.recommendations,
    recommendationFoods: db.recommendationFoods,
    foods: db.foods,
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PatientRecommendationsHero firstName={user.firstName} />

      {!viewModel ? (
        <PatientRecommendationsEmptyState />
      ) : (
        <>
          <PatientRecommendationsSummary
            nutritionalStatus={viewModel.nutritionalStatus}
            dateLabel={viewModel.dateLabel}
            medicalRecommendation={viewModel.medicalRecommendation}
            dietaryRecommendation={viewModel.dietaryRecommendation}
          />

          <PatientRecommendedFoodsTable rows={viewModel.suggestedFoods} />

          <PatientRestrictedFoodsList groups={viewModel.restrictedGroups} />
        </>
      )}
    </div>
  );
}
