import type { SavedConsultationSnapshot } from "@/store/useConsultationStore";

import type {
  DashboardConsultationRecord,
  WeightTrend,
} from "../types";

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function deriveStatusFromSnapshot(zScore?: number): string {
  if (typeof zScore !== "number") return "Sin diagnóstico";
  if (zScore <= -3) return "Desnutricion aguda severa";
  if (zScore <= -2) return "Desnutricion aguda moderada";
  if (zScore < -1) return "Riesgo de desnutricion";
  if (zScore <= 1) return "Eutrofico";
  if (zScore <= 2) return "Sobrepeso";
  return "Obesidad";
}

export function formatZScore(zScore: number | null): string {
  if (zScore === null || !Number.isFinite(zScore)) return "Sin dato";
  return zScore.toFixed(2);
}

export function formatWeight(weightKg: number | null): string {
  if (weightKg === null || !Number.isFinite(weightKg)) return "Sin dato";
  return `${weightKg.toFixed(2)} kg`;
}

export function formatHeight(heightM: number | null): string {
  if (heightM === null || !Number.isFinite(heightM)) return "Sin dato";
  return `${heightM.toFixed(2)} m`;
}

export function getWeightTrend(
  currentWeightKg: number | null,
  previousWeightKg: number | null
): WeightTrend {
  if (currentWeightKg === null || previousWeightKg === null) {
    return {
      direction: "no-data",
      label: "Sin datos comparables",
    };
  }

  const deltaKg = Number((currentWeightKg - previousWeightKg).toFixed(2));
  if (Math.abs(deltaKg) < 0.05) {
    return {
      direction: "stable",
      label: "Peso estable frente al control previo",
    };
  }

  if (deltaKg > 0) {
    return {
      direction: "up",
      label: `Subio ${deltaKg.toFixed(2)} kg frente al control previo`,
    };
  }

  return {
    direction: "down",
    label: `Bajo ${Math.abs(deltaKg).toFixed(2)} kg frente al control previo`,
  };
}

export function buildDiagnosisHref(patientId: string, resultId: string | null): string {
  const params = new URLSearchParams({
    patientId,
    tab: "summary",
    step: "0",
  });

  if (resultId) {
    params.set("resultId", resultId);
  }

  return `/dashboard/clinician/diagnosis?${params.toString()}`;
}

export function getCriticalAlertReason(item: DashboardConsultationRecord): string | null {
  const status = normalizeText(item.nutritionalStatus);

  if (typeof item.zScore === "number" && item.zScore <= -3) {
    return "Puntaje Z menor o igual a -3.";
  }

  if (typeof item.zScore === "number" && item.zScore <= -2) {
    return "Puntaje Z menor o igual a -2.";
  }

  if (status.includes("desnutricion") && status.includes("aguda")) {
    return "Desnutricion aguda detectada.";
  }

  if (status.includes("desnutricion") && status.includes("severa")) {
    return "Desnutricion severa detectada.";
  }

  if (status.includes("riesgo") && status.includes("desnutricion")) {
    return "Riesgo nutricional relevante.";
  }

  return null;
}

export function buildSnapshotDateLabel(snapshotDate: Date): string {
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(snapshotDate);
}

export function toNullableNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

export function createSnapshotRecordId(snapshot: SavedConsultationSnapshot): string {
  return `snapshot-${snapshot.savedAt}`;
}
