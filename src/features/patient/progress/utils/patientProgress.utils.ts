import { calculateAgeInMonths, formatPediatricAge } from "@/lib/pediatricAge";
import type {
  AnthropometricData,
  ClinicalData,
  Consultation,
  Diagnosis,
  Patient,
  Recommendation,
  User,
} from "@/types";

import type { PatientProgressViewModel } from "../types";
import { buildProgressAchievements, buildProgressComparisonRows } from "./patientProgressComparison.utils";
import { formatDate } from "./patientProgressFormatting.utils";
import {
  buildPatientProgressRows,
  buildProgressGrowthIndicators,
} from "./patientProgressGrowth.utils";

type BuildPatientProgressViewModelParams = {
  userId: string;
  users: User[];
  patients: Patient[];
  consultations: Consultation[];
  anthropometricData: AnthropometricData[];
  clinicalData: ClinicalData[];
  diagnoses: Diagnosis[];
  recommendations: Recommendation[];
  hydrationSnapshot?: {
    patientId: string;
    waterGlassesPerDay: number | null;
  } | null;
};

export function buildPatientProgressViewModel(
  params: BuildPatientProgressViewModelParams
): PatientProgressViewModel | null {
  const {
    userId,
    users,
    patients,
    consultations,
    anthropometricData,
    clinicalData,
    diagnoses,
    recommendations,
    hydrationSnapshot,
  } = params;

  const patient = patients.find((item) => item.userId === userId) ?? null;
  if (!patient) return null;

  const patientUser = users.find((item) => item.userId === patient.userId) ?? null;
  const progressRows = buildPatientProgressRows({
    patient,
    consultations,
    anthropometricData,
  });

  const indicators = buildProgressGrowthIndicators(progressRows);
  const comparisonRows = buildProgressComparisonRows(progressRows);

  const latestRawRow = progressRows.length ? progressRows[progressRows.length - 1] : null;
  const latestClinicalNote =
    latestRawRow !== null
      ? clinicalData.find((item) => item.consultationId === latestRawRow.consultationId)?.observations ?? null
      : null;

  const diagnosisByConsultationId = new Map(
    diagnoses.map((item) => [item.consultationId, item] as const)
  );
  const recommendationByDiagnosisId = new Map(
    recommendations.map((item) => [item.diagnosisId, item] as const)
  );
  const latestRecommendation =
    latestRawRow !== null
      ? recommendationByDiagnosisId.get(
          diagnosisByConsultationId.get(latestRawRow.consultationId)?.diagnosisId ?? ""
        ) ?? null
      : null;

  const latestRecommendationText = latestRecommendation
    ? `${latestRecommendation.medicalRecommendation} ${latestRecommendation.dietaryRecommendation}`.trim()
    : null;

  const snapshotWaterGlasses =
    hydrationSnapshot && hydrationSnapshot.patientId === patient.patientId
      ? hydrationSnapshot.waterGlassesPerDay
      : null;

  const achievements = buildProgressAchievements({
    comparisonRows,
    indicators,
    hydrationEvidence: {
      latestClinicalNote,
      latestRecommendation: latestRecommendationText,
      snapshotWaterGlasses,
    },
  });

  return {
    patientName: patientUser
      ? `${patientUser.firstName} ${patientUser.lastName}`
      : `${patient.firstName} ${patient.lastName}`,
    ageLabel: formatPediatricAge(calculateAgeInMonths(patient.birthDate)),
    latestDateLabel: latestRawRow ? latestRawRow.dateLabel : formatDate(null),
    indicators,
    comparisonRows,
    achievements,
  };
}
