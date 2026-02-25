import { calculateAgeInMonths, formatPediatricAge } from "@/lib/pediatricAge";
import type {
  AnthropometricData,
  Clinician,
  ClinicalData,
  Consultation,
  Diagnosis,
  Patient,
  Recommendation,
  User,
} from "@/types";

import type { PatientDiagnosisHistoryRow, PatientDiagnosisViewModel } from "../types";
import {
  buildQuickReason,
  formatDate,
  formatDateKey,
  inferConsultationNumberFromId,
} from "./patientDiagnosisFormatting.utils";
import {
  buildPatientGrowthRows,
  buildWeightForHeightChartData,
} from "./patientDiagnosisGrowth.utils";
import { inferDiagnosisStatusTone } from "./patientDiagnosisStatus.utils";

type BuildPatientDiagnosisViewModelParams = {
  userId: string;
  users: User[];
  patients: Patient[];
  clinicians: Clinician[];
  consultations: Consultation[];
  diagnoses: Diagnosis[];
  clinicalData: ClinicalData[];
  anthropometricData: AnthropometricData[];
  recommendations: Recommendation[];
};

function buildClinicianDisplayName(
  consultation: Consultation,
  cliniciansById: Map<string, Clinician>,
  usersById: Map<string, User>
): string {
  const clinician = cliniciansById.get(consultation.clinicianId) ?? null;
  if (!clinician) return "Profesional de nutricion";

  const clinicianUser = usersById.get(clinician.userId) ?? null;
  if (!clinicianUser) return "Profesional de nutricion";

  return `${clinicianUser.firstName} ${clinicianUser.lastName}`;
}

function buildDiagnosisSummary(details: string | null | undefined): string {
  const value = (details ?? "").trim();
  if (value.length) return value;
  return "No se registro una conclusion diagnostica detallada para esta consulta.";
}

export function buildPatientDiagnosisViewModel(
  params: BuildPatientDiagnosisViewModelParams
): PatientDiagnosisViewModel | null {
  const {
    userId,
    users,
    patients,
    clinicians,
    consultations,
    diagnoses,
    clinicalData,
    anthropometricData,
    recommendations,
  } = params;

  const patient = patients.find((item) => item.userId === userId) ?? null;
  if (!patient) return null;

  const patientUser = users.find((item) => item.userId === patient.userId) ?? null;
  const usersById = new Map(users.map((item) => [item.userId, item] as const));
  const cliniciansById = new Map(clinicians.map((item) => [item.clinicianId, item] as const));
  const diagnosisByConsultationId = new Map(
    diagnoses.map((item) => [item.consultationId, item] as const)
  );
  const clinicalByConsultationId = new Map(
    clinicalData.map((item) => [item.consultationId, item] as const)
  );
  const anthropometricByConsultationId = new Map(
    anthropometricData.map((item) => [item.consultationId, item] as const)
  );
  const recommendationByDiagnosisId = new Map(
    recommendations.map((item) => [item.diagnosisId, item] as const)
  );

  const growthRows = buildPatientGrowthRows({
    patientId: patient.patientId,
    birthDate: patient.birthDate,
    consultations,
    anthropometricData,
  });

  const rows: PatientDiagnosisHistoryRow[] = consultations
    .filter((consultation) => consultation.patientId === patient.patientId)
    .sort((first, second) => second.date.getTime() - first.date.getTime())
    .map((consultation) => {
      const diagnosis = diagnosisByConsultationId.get(consultation.consultationId) ?? null;
      if (!diagnosis) return null;

      const recommendation = recommendationByDiagnosisId.get(diagnosis.diagnosisId) ?? null;
      const clinicalRecord = clinicalByConsultationId.get(consultation.consultationId) ?? null;
      const anthropometricRecord =
        anthropometricByConsultationId.get(consultation.consultationId) ?? null;

      const nutritionalStatus = diagnosis.nutritionalDiagnosis || "Sin diagnóstico";
      const chartRows = growthRows.filter((row) => row.dateValue <= consultation.date.getTime());
      const chartData = buildWeightForHeightChartData(chartRows);

      const consultationNumber =
        inferConsultationNumberFromId(consultation.consultationId) ?? consultation.consultationId;

      return {
        diagnosisId: diagnosis.diagnosisId,
        consultationId: consultation.consultationId,
        consultationNumber,
        dateKey: formatDateKey(consultation.date),
        dateLabel: formatDate(consultation.date),
        reason: buildQuickReason(
          clinicalRecord?.observations ?? diagnosis.diagnosisDetails,
          "Control nutricional"
        ),
        nutritionalStatus,
        statusTone: inferDiagnosisStatusTone(nutritionalStatus),
        diagnosisSummary: buildDiagnosisSummary(diagnosis.diagnosisDetails),
        clinicianName: buildClinicianDisplayName(consultation, cliniciansById, usersById),
        medicalRecommendation:
          recommendation?.medicalRecommendation ?? "Sin recomendación médica registrada.",
        dietaryRecommendation:
          recommendation?.dietaryRecommendation ?? "Sin recomendación alimentaria registrada.",
        vitals: {
          weightKg: anthropometricRecord?.weightKg ?? null,
          heightM: anthropometricRecord?.heightM ?? null,
          headCircumferenceCm: anthropometricRecord?.headCircumferenceCm ?? null,
        },
        chart: chartData,
      } satisfies PatientDiagnosisHistoryRow;
    })
    .filter((row): row is PatientDiagnosisHistoryRow => row !== null);

  return {
    patientId: patient.patientId,
    patientName: patientUser
      ? `${patientUser.firstName} ${patientUser.lastName}`
      : `${patient.firstName} ${patient.lastName}`,
    patientIdentityNumber: patientUser?.identityNumber ?? patient.identityNumber,
    patientBirthDateLabel: formatDate(patient.birthDate),
    patientAgeLabel: formatPediatricAge(calculateAgeInMonths(patient.birthDate)),
    rows,
  };
}
