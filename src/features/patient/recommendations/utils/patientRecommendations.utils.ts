import type {
  Consultation,
  Diagnosis,
  Food,
  Patient,
  Recommendation,
  RecommendationFood,
  User,
} from "@/types";
import { buildRestrictedFoodGroupsByNutritionalStatus } from "@/features/shared/nutrition";

import type { PatientRecommendationViewModel } from "../types";
import { formatDate } from "./patientRecommendationsFormatting.utils";
import { buildPatientRecommendedFoodRows } from "./patientRecommendedFoods.utils";

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

  const suggestedFoods = buildPatientRecommendedFoodRows(
    selectedRecommendation?.recommendationId ?? null,
    recommendationFoods,
    foods
  );

  const nutritionalStatus = selectedDiagnosis.nutritionalDiagnosis || "Sin diagnóstico";

  return {
    patientName: patientUser
      ? `${patientUser.firstName} ${patientUser.lastName}`
      : `${patient.firstName} ${patient.lastName}`,
    dateLabel: formatDate(selectedConsultation?.date ?? null),
    nutritionalStatus,
    medicalRecommendation:
      selectedRecommendation?.medicalRecommendation ||
      "Sin recomendaciones médicas registradas.",
    dietaryRecommendation:
      selectedRecommendation?.dietaryRecommendation ||
      "Sin recomendaciones alimentarias registradas.",
    suggestedFoods,
    restrictedGroups: buildRestrictedFoodGroupsByNutritionalStatus(nutritionalStatus),
  };
}
