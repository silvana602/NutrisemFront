import type {
  PatientProgressAchievement,
  PatientProgressComparisonRow,
  PatientProgressGrowthIndicator,
  PatientProgressRawRow,
  PatientProgressTrendTone,
} from "../types";
import {
  formatSignedCentimeters,
  formatWeightDeltaAsGrams,
  normalizeText,
} from "./patientProgressFormatting.utils";

function inferWeightTone(deltaKg: number): PatientProgressTrendTone {
  if (deltaKg < -0.15) return "alert";
  if (Math.abs(deltaKg) <= 0.15) return "stable";
  return "up";
}

function inferHeightTone(deltaCm: number): PatientProgressTrendTone {
  if (deltaCm <= 0) return "alert";
  if (deltaCm < 0.6) return "stable";
  return "up";
}

function buildWeightGoal(currentWeightKg: number, deltaKg: number): number {
  const recommendedGain = deltaKg > 0 ? Math.max(0.2, deltaKg * 0.8) : 0.3;
  return Number((currentWeightKg + recommendedGain).toFixed(1));
}

function buildHeightGoal(currentHeightCm: number, deltaCm: number): number {
  const recommendedGain = deltaCm > 0 ? Math.max(0.8, deltaCm * 0.8) : 1.0;
  return Number((currentHeightCm + recommendedGain).toFixed(1));
}

function hasHydrationProgressEvidence(input: {
  latestClinicalNote?: string | null;
  latestRecommendation?: string | null;
  snapshotWaterGlasses?: number | null;
}): boolean {
  if (typeof input.snapshotWaterGlasses === "number" && input.snapshotWaterGlasses >= 5) {
    return true;
  }

  const mergedText = `${input.latestClinicalNote ?? ""} ${input.latestRecommendation ?? ""}`.trim();
  if (!mergedText) return false;

  const normalized = normalizeText(mergedText);
  const hydrationKeywords = ["hidrat", "agua", "liquido"];
  const progressKeywords = ["cumpl", "mejor", "adecuad", "meta", "estable"];

  const hasHydrationKeyword = hydrationKeywords.some((keyword) => normalized.includes(keyword));
  const hasProgressKeyword = progressKeywords.some((keyword) => normalized.includes(keyword));

  return hasHydrationKeyword && hasProgressKeyword;
}

export function buildProgressComparisonRows(
  rows: PatientProgressRawRow[]
): PatientProgressComparisonRow[] {
  if (!rows.length) return [];

  const start = rows[0];
  const previous = rows.length > 1 ? rows[rows.length - 2] : rows[0];
  const current = rows[rows.length - 1];

  const weightDelta = Number((current.weightKg - previous.weightKg).toFixed(2));
  const heightDelta = Number((current.heightCm - previous.heightCm).toFixed(1));

  return [
    {
      id: "weight",
      label: "Peso",
      startValue: start.weightKg,
      previousValue: previous.weightKg,
      currentValue: current.weightKg,
      goalValue: buildWeightGoal(current.weightKg, weightDelta),
      unit: "kg",
      deltaValue: weightDelta,
      deltaLabel: formatWeightDeltaAsGrams(weightDelta),
      tone: inferWeightTone(weightDelta),
    },
    {
      id: "height",
      label: "Talla",
      startValue: start.heightCm,
      previousValue: previous.heightCm,
      currentValue: current.heightCm,
      goalValue: buildHeightGoal(current.heightCm, heightDelta),
      unit: "cm",
      deltaValue: heightDelta,
      deltaLabel: formatSignedCentimeters(heightDelta),
      tone: inferHeightTone(heightDelta),
    },
  ];
}

export function buildProgressAchievements(params: {
  comparisonRows: PatientProgressComparisonRow[];
  indicators: PatientProgressGrowthIndicator[];
  hydrationEvidence?: {
    latestClinicalNote?: string | null;
    latestRecommendation?: string | null;
    snapshotWaterGlasses?: number | null;
  };
}): PatientProgressAchievement[] {
  const { comparisonRows, indicators, hydrationEvidence } = params;
  const heightRow = comparisonRows.find((row) => row.id === "height") ?? null;
  const weightRow = comparisonRows.find((row) => row.id === "weight") ?? null;
  const weightIndicator = indicators.find((indicator) => indicator.id === "weightForAge") ?? null;
  const weightPercentile = weightIndicator?.points.at(-1)?.percentile ?? null;

  const growthSpurtUnlocked = (heightRow?.deltaValue ?? 0) >= 1.5;
  const weightStableUnlocked =
    weightRow !== null &&
    weightPercentile !== null &&
    weightPercentile >= 15 &&
    weightPercentile <= 85 &&
    weightRow.deltaValue >= -0.15;
  const hydrationUnlocked = hydrationEvidence ? hasHydrationProgressEvidence(hydrationEvidence) : false;

  return [
    {
      id: "growth-spurt",
      title: "Estiron detectado",
      description: growthSpurtUnlocked
        ? "La talla crecio por encima del incremento habitual desde el control anterior."
        : "Aun no hay un salto de talla marcado; sigue con el plan de seguimiento.",
      unlocked: growthSpurtUnlocked,
    },
    {
      id: "weight-stable",
      title: "Peso estable",
      description: weightStableUnlocked
        ? "El peso se mantiene dentro de su rango saludable sin caidas no planificadas."
        : "Todavia se necesita estabilizar mejor el peso en su rango esperado.",
      unlocked: weightStableUnlocked,
    },
    {
      id: "hydration-goal",
      title: "Meta de hidratacion cumplida",
      description: hydrationUnlocked
        ? "Se registro progreso en hidratacion segun el seguimiento clinico."
        : "La meta de hidratacion sigue en curso para el proximo control.",
      unlocked: hydrationUnlocked,
    },
  ];
}
