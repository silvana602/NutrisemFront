import type {
  AnthropometricTrendPoint,
  AnthropometricZone,
} from "@/components/organisms/clinician/diagnosis/AnthropometricTrendChart";

export type PatientDiagnosisStatusTone = AnthropometricZone;

export type PatientDiagnosisChartData = {
  title: string;
  unit: string;
  interpretation: string;
  points: AnthropometricTrendPoint[];
};

export type PatientDiagnosisHistoryRow = {
  diagnosisId: string;
  consultationId: string;
  consultationNumber: string;
  dateKey: string;
  dateLabel: string;
  reason: string;
  nutritionalStatus: string;
  statusTone: PatientDiagnosisStatusTone;
  diagnosisSummary: string;
  clinicianName: string;
  medicalRecommendation: string;
  dietaryRecommendation: string;
  vitals: {
    weightKg: number | null;
    heightM: number | null;
    headCircumferenceCm: number | null;
  };
  chart: PatientDiagnosisChartData;
};

export type PatientDiagnosisViewModel = {
  patientId: string;
  patientName: string;
  patientIdentityNumber: string;
  patientBirthDateLabel: string;
  patientAgeLabel: string;
  rows: PatientDiagnosisHistoryRow[];
};
