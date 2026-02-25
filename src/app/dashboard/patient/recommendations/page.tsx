"use client";

import { useState } from "react";

import { useAuthStore } from "@/store/useAuthStore";
import { db, seedOnce } from "@/mocks/db";

import {
  PatientLatestDietaryRecommendation,
  PatientRecommendedFoodsTable,
  PatientRecommendationsEmptyState,
  PatientRecommendationsHero,
  PatientRecommendationsPdfDownloadCard,
  PatientRestrictedFoodsList,
} from "@/features/patient/recommendations/components";
import {
  buildPatientRecommendationViewModel,
  generatePatientRecommendationsPdf,
} from "@/features/patient/recommendations/utils";

seedOnce();

export default function PatientRecommendationsPage() {
  const user = useAuthStore((state) => state.user);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
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

  const handleDownloadPdf = async () => {
    if (!viewModel) return;

    setIsGeneratingPdf(true);
    try {
      await generatePatientRecommendationsPdf({
        patient: viewModel,
      });
    } catch (error) {
      console.error("Error generando PDF de recomendaciones del paciente:", error);
      window.alert("No se pudo generar el PDF. Intenta nuevamente.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PatientRecommendationsHero firstName={user.firstName} />

      {!viewModel ? (
        <PatientRecommendationsEmptyState />
      ) : (
        <>
          <PatientLatestDietaryRecommendation
            dietaryRecommendation={viewModel.dietaryRecommendation}
            dateLabel={viewModel.dateLabel}
            nutritionalStatus={viewModel.nutritionalStatus}
            totalSuggestedFoods={viewModel.suggestedFoods.length}
          />

          <PatientRecommendedFoodsTable rows={viewModel.suggestedFoods} />

          <PatientRestrictedFoodsList groups={viewModel.restrictedGroups} />

          <PatientRecommendationsPdfDownloadCard
            isGenerating={isGeneratingPdf}
            onDownloadPdf={handleDownloadPdf}
          />
        </>
      )}
    </div>
  );
}
