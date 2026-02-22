import type {
  Consultation,
  Diagnosis,
  Food,
  Patient,
  Recommendation,
  RecommendationFood,
  User,
} from "@/types";

import type {
  PatientRecommendationViewModel,
  RecommendedFoodRow,
} from "../types";
import { buildRestrictedFoodGroupsByNutritionalStatus } from "@/features/shared/nutrition";

type BuildPatientRecommendationModelParams = {
  userId: string;
  users: User[];
  patients: Patient[];
  consultations: Consultation[];
  diagnoses: Diagnosis[];
  recommendations: Recommendation[];
  recommendationFoods: RecommendationFood[];
  foods: Food[];
};

const dateFormatter = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
});

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDate(value: Date | null): string {
  if (!value) return "Sin fecha";
  if (Number.isNaN(value.getTime())) return "Sin fecha";
  return dateFormatter.format(value);
}

function formatCategoryLabel(category: string): string {
  const normalized = normalizeText(category);
  if (normalized.includes("fruit")) return "Fruta";
  if (normalized.includes("vegetable")) return "Verdura";
  if (normalized.includes("protein")) return "Proteina";
  if (normalized.includes("grain")) return "Cereal";
  if (normalized.includes("dairy")) return "Lacteo";
  return category || "Sin categoria";
}

function buildRecommendedFoodRows(
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

      return {
        foodId: food.foodId,
        foodName: food.foodName,
        category: formatCategoryLabel(food.category),
        dailyAmount: item.dailyAmount,
        referenceAge: item.referenceAge,
        energyKcal: food.energyKcal,
        proteinG: food.proteinG,
        fatG: food.fatG,
        carbohydratesG: food.carbohydratesG,
        fiberG: food.fiberG,
      };
    })
    .filter((item): item is RecommendedFoodRow => item !== null);
}

export function buildPatientRecommendationViewModel(
  params: BuildPatientRecommendationModelParams
): PatientRecommendationViewModel | null {
  const {
    userId,
    users,
    patients,
    consultations,
    diagnoses,
    recommendations,
    recommendationFoods,
    foods,
  } = params;

  const patient = patients.find((item) => item.userId === userId) ?? null;
  if (!patient) return null;

  const patientUser = users.find((item) => item.userId === patient.userId) ?? null;

  const consultationById = new Map(
    consultations
      .filter((item) => item.patientId === patient.patientId)
      .map((item) => [item.consultationId, item] as const)
  );

  const diagnosisForPatient = diagnoses
    .filter((item) => consultationById.has(item.consultationId))
    .sort((first, second) => {
      const firstDate = consultationById.get(first.consultationId)?.date.getTime() ?? 0;
      const secondDate = consultationById.get(second.consultationId)?.date.getTime() ?? 0;
      return secondDate - firstDate;
    });

  const recommendationByDiagnosisId = new Map(
    recommendations.map((item) => [item.diagnosisId, item] as const)
  );

  const selectedDiagnosis =
    diagnosisForPatient.find((item) => recommendationByDiagnosisId.has(item.diagnosisId)) ??
    diagnosisForPatient[0] ??
    null;

  if (!selectedDiagnosis) return null;

  const selectedRecommendation =
    recommendationByDiagnosisId.get(selectedDiagnosis.diagnosisId) ?? null;
  const selectedConsultation =
    consultationById.get(selectedDiagnosis.consultationId) ?? null;

  const suggestedFoods = buildRecommendedFoodRows(
    selectedRecommendation?.recommendationId ?? null,
    recommendationFoods,
    foods
  );

  const nutritionalStatus = selectedDiagnosis.nutritionalDiagnosis || "Sin diagnostico";

  return {
    patientName: patientUser
      ? `${patientUser.firstName} ${patientUser.lastName}`
      : `${patient.firstName} ${patient.lastName}`,
    dateLabel: formatDate(selectedConsultation?.date ?? null),
    nutritionalStatus,
    medicalRecommendation:
      selectedRecommendation?.medicalRecommendation ||
      "Sin recomendaciones medicas registradas.",
    dietaryRecommendation:
      selectedRecommendation?.dietaryRecommendation ||
      "Sin recomendaciones alimentarias registradas.",
    suggestedFoods,
    restrictedGroups: buildRestrictedFoodGroupsByNutritionalStatus(nutritionalStatus),
  };
}
