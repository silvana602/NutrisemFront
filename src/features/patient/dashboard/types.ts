import type { Recommendation } from "@/types";

export type ZoneLevel = "green" | "yellow" | "red";

export type ProgressDirection = "improved" | "declined" | "stable" | "no-data";

export type ZoneCopy = {
  label: string;
  message: string;
};

export type ProgressCopy = {
  title: string;
  subtitle: string;
  badgeClassName: string;
  badgeLabel: string;
};

export type ConsultationSnapshot = {
  dateLabel: string;
  weightKg: number | null;
  heightM: number | null;
  muacCm: number | null;
  headCircumferenceCm: number | null;
  bmi: number | null;
  nutritionalStatus: string | null;
  recommendation: Recommendation | null;
};
