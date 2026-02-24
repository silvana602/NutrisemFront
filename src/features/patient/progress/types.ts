import type { AnthropometricTrendPoint } from "@/components/organisms/clinician/diagnosis/AnthropometricTrendChart";

export type PatientProgressIndicatorId = "weightForAge" | "heightForAge";

export type PatientProgressTrendTone = "up" | "stable" | "alert";

export type PatientProgressAchievementId =
  | "growth-spurt"
  | "weight-stable"
  | "hydration-goal";

export type PatientProgressRawRow = {
  consultationId: string;
  dateKey: string;
  dateLabel: string;
  dateValue: number;
  ageMonths: number;
  weightKg: number;
  heightCm: number;
};

export type PatientProgressGrowthIndicator = {
  id: PatientProgressIndicatorId;
  title: string;
  unit: string;
  points: AnthropometricTrendPoint[];
  latestMessage: string;
  isNearMedian: boolean;
  highlightLabel: string | null;
};

export type PatientProgressComparisonRow = {
  id: "weight" | "height";
  label: string;
  startValue: number;
  previousValue: number;
  currentValue: number;
  goalValue: number;
  unit: "kg" | "cm";
  deltaValue: number;
  deltaLabel: string;
  tone: PatientProgressTrendTone;
};

export type PatientProgressAchievement = {
  id: PatientProgressAchievementId;
  title: string;
  description: string;
  unlocked: boolean;
};

export type PatientProgressViewModel = {
  patientName: string;
  ageLabel: string;
  latestDateLabel: string;
  indicators: PatientProgressGrowthIndicator[];
  comparisonRows: PatientProgressComparisonRow[];
  achievements: PatientProgressAchievement[];
};
