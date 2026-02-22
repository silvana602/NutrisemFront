import type { LastPatientTrendDirection } from "@/components/molecules/LastPatientCard";

export type DashboardConsultationRecord = {
  recordId: string;
  consultationId: string | null;
  patientId: string;
  patientName: string;
  guardianName: string;
  identityNumber: string;
  ageLabel: string;
  genderLabel: string;
  date: Date;
  dateLabel: string;
  weightKg: number | null;
  heightM: number | null;
  nutritionalStatus: string;
  zScore: number | null;
  source: "history" | "snapshot";
};

export type HistoricalDashboardConsultationRecord = Omit<
  DashboardConsultationRecord,
  "consultationId" | "source"
> & {
  consultationId: string;
  source: "history";
};

export type AlertRecord = {
  item: DashboardConsultationRecord;
  reason: string;
};

export type WeightTrend = {
  direction: LastPatientTrendDirection;
  label: string;
};
