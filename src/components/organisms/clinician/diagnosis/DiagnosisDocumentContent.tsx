"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Heading } from "@/components/atoms/Heading";
import { SearchBar } from "@/components/molecules/SearchBar";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { StepDots } from "../new-consultation/forms/shared/StepDots";
import { DiagnosisRestrictedFoodsSection } from "@/features/clinician/diagnosis/recommendations/components";
import { getDiagnosisRestrictedFoodGroups } from "@/features/clinician/diagnosis/recommendations/utils/diagnosisRecommendationRestrictions.utils";
import {
  AnthropometricTrendChart,
  type AnthropometricPercentileProfile,
  type AnthropometricTrendPoint,
  type AnthropometricZone,
} from "./AnthropometricTrendChart";
import { db, seedOnce } from "@/mocks/db";
import {
  calculateAgeInMonths,
  formatPediatricAge,
  isTargetPediatricAge,
} from "@/lib/pediatricAge";
import {
  useConsultationStore,
} from "@/store/useConsultationStore";
import type {
  AntecedentFoodGroupId as HistoricalFoodGroupId,
  AntecedentMealSlotId as HistoricalMealSlotId,
  AntecedentRecallSlotId as HistoricalRecallSlotId,
} from "@/types";

seedOnce();

type DiagnosisTabId = "summary" | "results";

type DiagnosisResult = {
  id: string;
  source: "last_consultation" | "history";
  patientId: string;
  patientName: string;
  attendedByName: string;
  identityNumber: string;
  ageMonths: number;
  nutritionalStatus: string;
  dateValue: number;
  dateKey: string;
  dateLabel: string;
  diagnosisDetails?: string;
  bmi?: number;
  zScore?: number;
};

const DIAGNOSIS_TABS: readonly TabItem<DiagnosisTabId>[] = [
  { id: "summary", label: "Resumen de la última consulta" },
  { id: "results", label: "Resultados" },
];

const RESULTS_STEPS = [
  { id: "final", title: "Diagnóstico Final" },
  { id: "recommendations", title: "Recomendaciones" },
  { id: "trends", title: "Progreso antropometrico" },
] as const;

const FOOD_GROUP_LABELS: Record<HistoricalFoodGroupId, string> = {
  cerealsTubers: "Cereales / tuberculos",
  fruits: "Frutas",
  vegetables: "Verduras",
  dairy: "Lacteos",
  meatsProteins: "Carnes / proteinas",
  legumes: "Legumbres",
  ultraProcessed: "Alimentos ultraprocesados / snacks",
  eggs: "Huevos",
  fishSeafood: "Pescados y mariscos",
  water: "Agua simple",
  sugaryDrinks: "Bebidas azucaradas",
  fastFoodFried: "Comida rapida / frituras",
};

const MEAL_SLOT_LABELS: Record<HistoricalMealSlotId, string> = {
  breakfast: "Desayuno",
  midMorningSnack: "Media manana",
  lunch: "Almuerzo",
  afternoonSnack: "Merienda",
  dinner: "Cena",
  nightSnack: "Colacion nocturna",
};

const RECALL_SLOT_LABELS: Record<HistoricalRecallSlotId, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  dinner: "Cena",
  snacks: "Snacks/colaciones",
};

const ANTHROPOMETRIC_NORMAL_BUCKETS: readonly AnthropometricNormalBucket[] = [
  {
    fromMonths: 6,
    toMonths: 11,
    weightKg: { min: 6.5, max: 11.0 },
    heightCm: { min: 65, max: 78 },
    muacCm: { min: 12.5, max: 16.5 },
    headCircumferenceCm: { min: 42, max: 47 },
  },
  {
    fromMonths: 12,
    toMonths: 23,
    weightKg: { min: 8.0, max: 13.5 },
    heightCm: { min: 73, max: 90 },
    muacCm: { min: 12.8, max: 17.0 },
    headCircumferenceCm: { min: 45, max: 50 },
  },
  {
    fromMonths: 24,
    toMonths: 35,
    weightKg: { min: 10.0, max: 16.0 },
    heightCm: { min: 83, max: 98 },
    muacCm: { min: 13.0, max: 17.5 },
    headCircumferenceCm: { min: 47, max: 51 },
  },
  {
    fromMonths: 36,
    toMonths: 47,
    weightKg: { min: 12.0, max: 19.0 },
    heightCm: { min: 92, max: 106 },
    muacCm: { min: 13.2, max: 18.0 },
    headCircumferenceCm: { min: 48, max: 52 },
  },
  {
    fromMonths: 48,
    toMonths: 60,
    weightKg: { min: 14.0, max: 22.0 },
    heightCm: { min: 100, max: 115 },
    muacCm: { min: 13.5, max: 18.5 },
    headCircumferenceCm: { min: 49, max: 53 },
  },
];

const DEFAULT_ANTHROPOMETRIC_RANGES: Record<AnthropometricMetricKey, MetricNormalRange> = {
  weightKg: { min: 6.5, max: 22.0 },
  heightCm: { min: 65, max: 115 },
  muacCm: { min: 12.5, max: 18.5 },
  headCircumferenceCm: { min: 42, max: 53 },
};

const WEIGHT_FOR_HEIGHT_BUCKETS: readonly WeightForHeightBucket[] = [
  { fromHeightCm: 65, toHeightCm: 74, weightKg: { min: 6.5, max: 9.8 } },
  { fromHeightCm: 75, toHeightCm: 84, weightKg: { min: 8.0, max: 12.0 } },
  { fromHeightCm: 85, toHeightCm: 94, weightKg: { min: 10.0, max: 15.0 } },
  { fromHeightCm: 95, toHeightCm: 104, weightKg: { min: 12.0, max: 18.5 } },
  { fromHeightCm: 105, toHeightCm: 115, weightKg: { min: 14.0, max: 22.0 } },
];

const WHO_PERCENTILE_ANCHORS = [
  { key: "p3", percentile: 3, zScore: -2 },
  { key: "p15", percentile: 15, zScore: -1 },
  { key: "p50", percentile: 50, zScore: 0 },
  { key: "p85", percentile: 85, zScore: 1 },
  { key: "p97", percentile: 97, zScore: 2 },
] as const;

type RecommendationFoodRow = {
  foodId: string;
  foodName: string;
  category: string;
  portion: string;
  timesPerDay: string;
  referenceAge: string;
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbohydratesG: number;
  fiberG: number;
  vitamins: string;
  minerals: string;
};

type AnthropometricMetricKey =
  | "weightKg"
  | "heightCm"
  | "muacCm"
  | "headCircumferenceCm";

type GrowthIndicatorId = "weightForAge" | "heightForAge" | "weightForHeight";

type AnthropometricTrendRow = {
  id: string;
  dateValue: number;
  dateKey: string;
  dateLabel: string;
  ageMonths: number;
  weightKg: number;
  heightCm: number;
  muacCm: number;
  headCircumferenceCm: number;
};

type MetricNormalRange = { min: number; max: number };

type AnthropometricNormalBucket = {
  fromMonths: number;
  toMonths: number;
  weightKg: MetricNormalRange;
  heightCm: MetricNormalRange;
  muacCm: MetricNormalRange;
  headCircumferenceCm: MetricNormalRange;
};

type WeightForHeightBucket = {
  fromHeightCm: number;
  toHeightCm: number;
  weightKg: MetricNormalRange;
};

type GrowthIndicatorDefinition = {
  id: GrowthIndicatorId;
  title: string;
  shortTitle: string;
  unit: string;
  description: string;
  getActualValue: (row: AnthropometricTrendRow) => number;
  getReferenceProfile: (row: AnthropometricTrendRow) => AnthropometricPercentileProfile;
};

type GrowthIndicatorAssessment = {
  id: GrowthIndicatorId;
  title: string;
  shortTitle: string;
  unit: string;
  description: string;
  points: AnthropometricTrendPoint[];
  latestPoint: AnthropometricTrendPoint;
  statusLabel: string;
  interpretation: string;
  tone: AnthropometricZone;
  percentileDelta: number;
  zDelta: number;
  hasCurveDrop: boolean;
};

type GrowthOverview = {
  label: string;
  summary: string;
  tone: AnthropometricZone;
  curveDropAlerts: string[];
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "Sin dato";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Sin dato";
  return String(value);
}

function formatDateTime(isoDate?: string): string {
  if (!isoDate) return "Sin dato";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Sin dato";
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDateKey(value: string | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function deriveStatusFromMetrics(bmi?: number, zScore?: number): string {
  if (typeof zScore === "number") {
    if (zScore <= -3) return "Desnutricion aguda severa";
    if (zScore <= -2) return "Desnutricion aguda moderada";
    if (zScore < -1) return "Riesgo de desnutricion";
    if (zScore <= 1) return "Estado normal";
    if (zScore <= 2) return "Sobrepeso";
    return "Obesidad";
  }

  if (typeof bmi === "number") {
    if (bmi < 14) return "Desnutricion aguda";
    if (bmi < 18) return "Estado normal";
    if (bmi < 20) return "Sobrepeso";
    return "Obesidad";
  }

  return "Sin clasificar";
}

function buildDefaultMedicalRecommendation(nutritionalStatus: string): string {
  const status = normalizeText(nutritionalStatus);

  if (status.includes("desnutricion")) {
    return "Se recomienda seguimiento clínico estrecho, control de peso y talla semanal, tamizaje de comorbilidades y vigilancia de signos de alarma en domicilio.";
  }

  if (status.includes("sobrepeso") || status.includes("obesidad")) {
    return "Se recomienda control mensual, promocion de actividad fisica acorde a la edad, reduccion de ultraprocesados y evaluacion periodica de habitos familiares.";
  }

  return "Se recomienda control periódico en consulta, refuerzo de prácticas de alimentacion saludable y monitoreo de crecimiento según calendario pediátrico.";
}

function buildDefaultDietaryRecommendation(nutritionalStatus: string): string {
  const status = normalizeText(nutritionalStatus);

  if (status.includes("desnutricion")) {
    return "Incrementar densidad energética en 5-6 tiempos de comida al dia, con porciones pequeñas y frecuentes, priorizando proteina de alto valor biológico y alimentos fortificados.";
  }

  if (status.includes("sobrepeso") || status.includes("obesidad")) {
    return "Mantener 4-5 tiempos de comida con horarios fijos, controlar porciones, aumentar verduras y frutas, y evitar bebidas azucaradas y frituras.";
  }

  return "Mantener 4-5 tiempos de comida al dia con horarios regulares, porciones adecuadas para la edad y equilibrio entre cereales, proteinas, frutas, verduras y lacteos.";
}

function translateFoodCategory(category: string): string {
  const normalized = normalizeText(category);
  if (normalized.includes("fruit")) return "Fruta";
  if (normalized.includes("vegetable")) return "Verdura";
  if (normalized.includes("grain")) return "Cereal";
  if (normalized.includes("protein")) return "Proteina";
  if (normalized.includes("dairy")) return "Lacteo";
  return category;
}

function translateFoodName(foodName: string): string {
  const normalized = normalizeText(foodName);
  const dictionary: Record<string, string> = {
    apple: "Manzana",
    banana: "Platano",
    pear: "Pera",
    orange: "Naranja",
    milk: "Leche",
    egg: "Huevo",
    chicken: "Pollo",
    fish: "Pescado",
    rice: "Arroz",
    oat: "Avena",
  };

  return dictionary[normalized] ?? foodName;
}

function translateReferenceAge(referenceAge: string): string {
  return referenceAge
    .replace(/years?/gi, "años")
    .replace(/year/gi, "año")
    .replace(/months?/gi, "meses")
    .replace(/month/gi, "mes");
}

function translatePortionText(rawPortion: string): string {
  const value = rawPortion.trim();
  if (!value) return "Porcion sugerida";

  return value
    .replace(/pieces?/gi, "piezas")
    .replace(/servings?/gi, "porciones")
    .replace(/cups?/gi, "tazas")
    .replace(/spoons?/gi, "cucharadas")
    .replace(/units?/gi, "unidades")
    .replace(/per day/gi, "por dia")
    .replace(/daily/gi, "diario");
}

function inferTimesPerDay(rawPortion: string): string {
  const normalized = normalizeText(rawPortion);
  const explicitMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(veces|x)\s*(al|por)?\s*dia/);
  if (explicitMatch) {
    return `${explicitMatch[1].replace(",", ".")} veces/dia`;
  }

  if (normalized.includes("cada comida")) return "3 veces/dia";
  if (normalized.includes("cada colacion")) return "2 veces/dia";

  return "1 vez/dia";
}

function getAnthropometricNormalRange(
  ageMonths: number,
  metricKey: AnthropometricMetricKey
): MetricNormalRange {
  const bucket = ANTHROPOMETRIC_NORMAL_BUCKETS.find(
    (item) => ageMonths >= item.fromMonths && ageMonths <= item.toMonths
  );

  if (!bucket) return DEFAULT_ANTHROPOMETRIC_RANGES[metricKey];

  return bucket[metricKey];
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function interpolateValue(startValue: number, endValue: number, ratio: number): number {
  return startValue + (endValue - startValue) * ratio;
}

function interpolateAnchors(
  input: number,
  firstAnchor: { value: number; mapped: number },
  secondAnchor: { value: number; mapped: number }
): number {
  if (Math.abs(secondAnchor.value - firstAnchor.value) < 0.0001) {
    return firstAnchor.mapped;
  }

  const ratio = (input - firstAnchor.value) / (secondAnchor.value - firstAnchor.value);
  return interpolateValue(firstAnchor.mapped, secondAnchor.mapped, ratio);
}

function buildPercentileProfileFromRange(range: MetricNormalRange): AnthropometricPercentileProfile {
  const span = Math.max(range.max - range.min, 0.0001);
  const valueByPercentile = (percentile: number) => {
    const ratio = (percentile - 3) / 94;
    return Number((range.min + span * ratio).toFixed(2));
  };

  return {
    p3: Number(range.min.toFixed(2)),
    p15: valueByPercentile(15),
    p50: valueByPercentile(50),
    p85: valueByPercentile(85),
    p97: Number(range.max.toFixed(2)),
  };
}

function getWeightForHeightRange(heightCm: number): MetricNormalRange {
  if (!Number.isFinite(heightCm)) {
    return DEFAULT_ANTHROPOMETRIC_RANGES.weightKg;
  }

  const bucket = WEIGHT_FOR_HEIGHT_BUCKETS.find(
    (item) => heightCm >= item.fromHeightCm && heightCm <= item.toHeightCm
  );

  return bucket?.weightKg ?? DEFAULT_ANTHROPOMETRIC_RANGES.weightKg;
}

function getWeightForHeightReferenceProfile(heightCm: number): AnthropometricPercentileProfile {
  return buildPercentileProfileFromRange(getWeightForHeightRange(heightCm));
}

function estimateFromPercentileAnchors(
  value: number,
  mappedByPercentile: ReadonlyArray<{ value: number; mapped: number }>
): number {
  if (!mappedByPercentile.length) return 0;
  if (mappedByPercentile.length === 1) return mappedByPercentile[0].mapped;

  const sortedAnchors = [...mappedByPercentile].sort((first, second) => first.value - second.value);

  if (value <= sortedAnchors[0].value) {
    return interpolateAnchors(value, sortedAnchors[0], sortedAnchors[1]);
  }

  for (let index = 1; index < sortedAnchors.length; index += 1) {
    const previousAnchor = sortedAnchors[index - 1];
    const currentAnchor = sortedAnchors[index];
    if (value <= currentAnchor.value) {
      return interpolateAnchors(value, previousAnchor, currentAnchor);
    }
  }

  const lastAnchor = sortedAnchors[sortedAnchors.length - 1];
  const penultimateAnchor = sortedAnchors[sortedAnchors.length - 2];
  return interpolateAnchors(value, penultimateAnchor, lastAnchor);
}

function estimateZScoreFromPercentiles(
  value: number,
  profile: AnthropometricPercentileProfile
): number {
  const anchors = WHO_PERCENTILE_ANCHORS.map((anchor) => ({
    value: profile[anchor.key],
    mapped: anchor.zScore,
  }));

  return Number(estimateFromPercentileAnchors(value, anchors).toFixed(2));
}

function estimatePercentileFromProfile(
  value: number,
  profile: AnthropometricPercentileProfile
): number {
  const anchors = WHO_PERCENTILE_ANCHORS.map((anchor) => ({
    value: profile[anchor.key],
    mapped: anchor.percentile,
  }));

  return Number(clampNumber(estimateFromPercentileAnchors(value, anchors), 0, 100).toFixed(1));
}

function getZoneFromPercentile(percentile: number): AnthropometricZone {
  if (percentile < 3 || percentile > 97) return "red";
  if (percentile < 15 || percentile > 85) return "yellow";
  return "green";
}

function getToneClasses(tone: AnthropometricZone): string {
  if (tone === "green") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "yellow") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function formatSigned(value: number, maximumFractionDigits = 1): string {
  const formatted = value.toFixed(maximumFractionDigits);
  return value > 0 ? `+${formatted}` : formatted;
}

function buildIndicatorStatusLabel(
  indicatorId: GrowthIndicatorId,
  zScore: number,
  hasCurveDrop: boolean
): string {
  if (indicatorId === "weightForHeight") {
    if (zScore <= -3) return "Desnutricion aguda severa";
    if (zScore <= -2) return "Desnutricion aguda moderada";
    if (zScore < -1 || hasCurveDrop) return "Riesgo de desnutricion";
    if (zScore <= 1.5) return "Eutrofico";
    if (zScore <= 2.5) return "Sobrepeso";
    return "Obesidad";
  }

  if (indicatorId === "heightForAge") {
    if (zScore <= -3) return "Talla muy baja para la edad";
    if (zScore <= -2) return "Talla baja para la edad";
    if (zScore < -1 || hasCurveDrop) return "Riesgo de talla baja";
    return "Talla adecuada para la edad";
  }

  if (zScore <= -3) return "Desnutricion global severa";
  if (zScore <= -2) return "Desnutricion global moderada";
  if (zScore < -1 || hasCurveDrop) return "Riesgo de desnutricion";
  if (zScore <= 2) return "Peso adecuado para la edad";
  return "Peso alto para la edad";
}

function buildIndicatorInterpretation(
  indicatorTitle: string,
  unit: string,
  latestPoint: AnthropometricTrendPoint,
  previousPoint: AnthropometricTrendPoint | null,
  statusLabel: string
): string {
  if (!previousPoint) {
    return `${indicatorTitle}: valor actual ${latestPoint.actual.toFixed(2)} ${unit}, percentil ${latestPoint.percentile.toFixed(
      1
    )} y Puntaje Z ${latestPoint.zScore.toFixed(2)}. Clasificación: ${statusLabel}.`;
  }

  const percentileDelta = latestPoint.percentile - previousPoint.percentile;
  let trendLabel = "sin cambios relevantes en la trayectoria.";

  if (percentileDelta <= -15) {
    trendLabel = "caída importante de la curva respecto a la consulta previa.";
  } else if (percentileDelta <= -5) {
    trendLabel = "tendencia descendente de la curva.";
  } else if (percentileDelta >= 10) {
    trendLabel = "ascenso de la curva de crecimiento.";
  }

  return `${indicatorTitle}: valor actual ${latestPoint.actual.toFixed(2)} ${unit}, percentil ${latestPoint.percentile.toFixed(
    1
  )} y Puntaje Z ${latestPoint.zScore.toFixed(
    2
  )}. Clasificación: ${statusLabel}; variación del percentil ${formatSigned(percentileDelta)} puntos (${trendLabel})`;
}

function buildGrowthOverview(indicators: GrowthIndicatorAssessment[]): GrowthOverview | null {
  if (!indicators.length) return null;

  const byId = new Map<GrowthIndicatorId, GrowthIndicatorAssessment>(
    indicators.map((indicator) => [indicator.id, indicator])
  );

  const weightForHeight = byId.get("weightForHeight");
  const weightForAge = byId.get("weightForAge");
  const heightForAge = byId.get("heightForAge");

  const minZScore = Math.min(...indicators.map((indicator) => indicator.latestPoint.zScore));
  const hasCurveDrop = indicators.some((indicator) => indicator.hasCurveDrop);
  const hasNutritionalRiskBand = indicators.some((indicator) => indicator.latestPoint.zScore < -1);

  let label = "Riesgo de desnutricion";
  let tone: AnthropometricZone = "yellow";
  let summary =
    "Se sugiere vigilancia estrecha de la curva de crecimiento con controles antropometricos frecuentes.";

  if ((weightForHeight?.latestPoint.zScore ?? -Infinity) >= 2) {
    label = "Sobrepeso / Obesidad";
    tone = (weightForHeight?.latestPoint.zScore ?? 0) >= 2.5 ? "red" : "yellow";
    summary =
      "El peso para la talla se encuentra por encima del rango esperado para la edad pediatrica y requiere intervencion de habitos.";
  } else if (minZScore <= -2) {
    label = "Desnutricion moderada/severa";
    tone = minZScore <= -3 ? "red" : "yellow";
    summary =
      "Existe déficit antropometrico importante (Puntaje Z < -2) y se recomienda seguimiento nutricional y clínico prioritario.";
  } else if (hasCurveDrop || hasNutritionalRiskBand) {
    label = "Riesgo de desnutricion";
    tone = "yellow";
    summary =
      "Se observa una tendencia descendente o valores cercanos al limite inferior; es necesario reforzar la alimentacion y controles cercanos.";
  } else if (
    weightForAge &&
    heightForAge &&
    weightForHeight &&
    Math.abs(weightForAge.latestPoint.zScore) <= 1 &&
    Math.abs(heightForAge.latestPoint.zScore) <= 1 &&
    Math.abs(weightForHeight.latestPoint.zScore) <= 1
  ) {
    label = "Eutrofico";
    tone = "green";
    summary =
      "Peso y talla se mantienen en percentiles esperados para la edad, con trayectoria estable en los tres indicadores OMS.";
  }

  const curveDropAlerts = indicators
    .filter((indicator) => indicator.hasCurveDrop)
    .map(
      (indicator) =>
        `Se detecta caída de la curva en ${indicator.shortTitle.toLowerCase()}. Se sugiere cita con nutricionista pediátrico en 15 dias.`
    );

  return { label, summary, tone, curveDropAlerts };
}

function buildAutomatedFollowUpRecommendations(params: {
  ageMonths: number | null;
  overview: GrowthOverview | null;
  indicators: GrowthIndicatorAssessment[];
}): string[] {
  const { ageMonths, overview, indicators } = params;
  const recommendations: string[] = [];

  if (ageMonths !== null && ageMonths >= 6 && ageMonths <= 12) {
    recommendations.push(
      "6-12 meses: mantener lactancia materna y reforzar alimentacion complementaria con pure de verduras, cereal fortificado y proteina blanda 2-3 veces al dia."
    );
    recommendations.push(
      "6-12 meses: introducir alimentos nuevos de forma progresiva, uno por vez, para vigilar tolerancia y alergias."
    );
  }

  if (ageMonths !== null && ageMonths >= 12 && ageMonths <= 60) {
    recommendations.push(
      "1-5 años: asegurar porcion diaria de proteina (huevo, carnes magras o legumbres), al menos 2 porciones de fruta y 2 de verduras."
    );
    recommendations.push(
      "1-5 años: priorizar agua simple y evitar bebidas azucaradas, frituras y snacks ultraprocesados."
    );
  }

  if (overview?.label === "Desnutricion moderada/severa") {
    recommendations.push(
      "Programar control antropometrico en 7 dias y vigilancia clinica estrecha hasta recuperar tendencia de crecimiento."
    );
  } else if (overview?.label === "Riesgo de desnutricion") {
    recommendations.push(
      "Reforzar plan alimentario en el hogar y repetir evaluacion antropometrica en 15 dias."
    );
  } else if (overview?.label === "Sobrepeso / Obesidad") {
    recommendations.push(
      "Ajustar porciones, aumentar actividad fisica acorde a la edad y controlar evolucion de peso para la talla en 30 dias."
    );
  } else if (overview?.label === "Eutrofico") {
    recommendations.push(
      "Continuar controles periodicos y mantener patron de alimentacion balanceado según edad pediatrica."
    );
  }

  if (overview?.curveDropAlerts.length) {
    recommendations.push(...overview.curveDropAlerts);
  } else if (indicators.some((indicator) => indicator.hasCurveDrop)) {
    recommendations.push(
      "Se sugiere cita con nutricionista pediátrico en 15 dias por descenso reciente de la curva de crecimiento."
    );
  }

  return Array.from(new Set(recommendations));
}

const PEDIATRIC_GROWTH_INDICATORS: readonly GrowthIndicatorDefinition[] = [
  {
    id: "weightForAge",
    title: "Peso para la edad",
    shortTitle: "Peso/Edad",
    unit: "kg",
    description: "Identifica desnutricion global o exceso de peso en relacion con la edad.",
    getActualValue: (row) => row.weightKg,
    getReferenceProfile: (row) =>
      buildPercentileProfileFromRange(getAnthropometricNormalRange(row.ageMonths, "weightKg")),
  },
  {
    id: "heightForAge",
    title: "Talla para la edad",
    shortTitle: "Talla/Edad",
    unit: "cm",
    description: "Principal marcador de desnutricion cronica cuando la talla cae de forma sostenida.",
    getActualValue: (row) => row.heightCm,
    getReferenceProfile: (row) =>
      buildPercentileProfileFromRange(getAnthropometricNormalRange(row.ageMonths, "heightCm")),
  },
  {
    id: "weightForHeight",
    title: "Peso para la talla",
    shortTitle: "Peso/Talla",
    unit: "kg",
    description:
      "Permite detectar desnutricion aguda o sobrepeso comparando el peso contra la estatura actual.",
    getActualValue: (row) => row.weightKg,
    getReferenceProfile: (row) => getWeightForHeightReferenceProfile(row.heightCm),
  },
];

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-nutri-light-grey py-2 sm:grid-cols-[260px_minmax(0,1fr)] sm:gap-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">{label}</p>
      <p className="text-sm text-nutri-dark-grey">{value}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2 rounded-xl border border-nutri-light-grey bg-nutri-white p-4 sm:p-5">
      <h3 className="text-base font-semibold text-nutri-primary">{title}</h3>
      <div>{children}</div>
    </section>
  );
}

type ReportFieldRow = {
  label: string;
  value: string;
};

type ReportSectionData = {
  title: string;
  rows: ReportFieldRow[];
};

type ReportChartAsset = {
  title: string;
  interpretation: string;
  svgMarkup: string;
  imageDataUrl?: string;
};

type ReportIdentityMetadata = {
  consultationNumber: string;
  patientName: string;
  consultationDate: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toSafeFileToken(value: string): string {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "SinDato";
}

function inferConsultationNumberFromId(consultationId: string): string | null {
  const explicitConsultationMatch = consultationId.match(/^con_(\d+)$/i);
  if (explicitConsultationMatch) return explicitConsultationMatch[1];

  if (consultationId.startsWith("snapshot-")) return null;

  const trailingDigitsMatch = consultationId.match(/(\d+)$/);
  return trailingDigitsMatch ? trailingDigitsMatch[1] : null;
}

function toHumanLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function buildRowsFromRecord(
  record: object,
  labelOverrides: Record<string, string> = {}
): ReportFieldRow[] {
  return Object.entries(record as Record<string, unknown>)
    .filter(([key]) => !key.toLowerCase().endsWith("id"))
    .map(([key, value]) => ({
      label: labelOverrides[key] ?? toHumanLabel(key),
      value: formatValue(value),
    }));
}

function toSvgPath(points: Array<{ x: number; y: number }>): string {
  if (!points.length) return "";

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
}

function buildGrowthChartSvgMarkup(title: string, unit: string, points: AnthropometricTrendPoint[]): string {
  const viewBoxWidth = 920;
  const viewBoxHeight = 300;
  const marginLeft = 52;
  const marginRight = 18;
  const marginTop = 16;
  const marginBottom = 52;
  const chartWidth = viewBoxWidth - marginLeft - marginRight;
  const chartHeight = viewBoxHeight - marginTop - marginBottom;

  if (!points.length) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}">
        <rect x="0" y="0" width="${viewBoxWidth}" height="${viewBoxHeight}" fill="#ffffff" />
        <text x="${viewBoxWidth / 2}" y="${viewBoxHeight / 2}" text-anchor="middle" font-size="18" fill="#5d6060">
          Sin datos para ${escapeHtml(title.toLowerCase())}
        </text>
      </svg>
    `;
  }

  const allValues = points.flatMap((point) => [
    point.actual,
    point.percentiles.p3,
    point.percentiles.p15,
    point.percentiles.p50,
    point.percentiles.p85,
    point.percentiles.p97,
  ]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const padding = Math.max((maxValue - minValue) * 0.1, 0.5);
  const domainMin = minValue - padding;
  const domainMax = maxValue + padding;
  const domainSpan = Math.max(domainMax - domainMin, 1);

  const xForIndex = (index: number): number => {
    if (points.length === 1) return marginLeft + chartWidth / 2;
    return marginLeft + (index / (points.length - 1)) * chartWidth;
  };
  const yForValue = (value: number): number => {
    return marginTop + ((domainMax - value) / domainSpan) * chartHeight;
  };

  const actualPoints = points.map((point, index) => ({ x: xForIndex(index), y: yForValue(point.actual) }));
  const p3Points = points.map((point, index) => ({ x: xForIndex(index), y: yForValue(point.percentiles.p3) }));
  const p15Points = points.map((point, index) => ({ x: xForIndex(index), y: yForValue(point.percentiles.p15) }));
  const p50Points = points.map((point, index) => ({ x: xForIndex(index), y: yForValue(point.percentiles.p50) }));
  const p85Points = points.map((point, index) => ({ x: xForIndex(index), y: yForValue(point.percentiles.p85) }));
  const p97Points = points.map((point, index) => ({ x: xForIndex(index), y: yForValue(point.percentiles.p97) }));

  const expectedRangeAreaPath = [
    toSvgPath(p85Points),
    toSvgPath([...p15Points].reverse()).replace(/^M/, "L"),
    "Z",
  ].join(" ");

  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, index) => {
    const factor = index / (tickCount - 1);
    const value = domainMax - factor * domainSpan;
    const y = yForValue(value);
    return { value, y };
  });

  const latestPoint = points[points.length - 1];
  const latestColor =
    latestPoint.zone === "green" ? "#2f7a36" : latestPoint.zone === "yellow" ? "#d18400" : "#b42318";

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}">
      <rect x="0" y="0" width="${viewBoxWidth}" height="${viewBoxHeight}" fill="#ffffff" />
      ${ticks
        .map(
          (tick) => `
            <line
              x1="${marginLeft}"
              x2="${viewBoxWidth - marginRight}"
              y1="${tick.y.toFixed(2)}"
              y2="${tick.y.toFixed(2)}"
              stroke="rgba(150, 150, 150, 0.2)"
              stroke-width="1"
            />
            <text x="${marginLeft - 8}" y="${(tick.y + 4).toFixed(2)}" text-anchor="end" font-size="11" fill="#5d6060">
              ${Math.abs(tick.value) >= 10 ? tick.value.toFixed(1) : tick.value.toFixed(2)}
            </text>
          `
        )
        .join("")}

      <path d="${expectedRangeAreaPath}" fill="rgba(92, 167, 102, 0.18)" stroke="none" />
      <path d="${toSvgPath(p3Points)}" fill="none" stroke="#b42318" stroke-width="1.6" stroke-dasharray="4 4" />
      <path d="${toSvgPath(p15Points)}" fill="none" stroke="#d18400" stroke-width="1.6" stroke-dasharray="6 3" />
      <path d="${toSvgPath(p50Points)}" fill="none" stroke="#2f7a36" stroke-width="2.4" />
      <path d="${toSvgPath(p85Points)}" fill="none" stroke="#d18400" stroke-width="1.6" stroke-dasharray="6 3" />
      <path d="${toSvgPath(p97Points)}" fill="none" stroke="#b42318" stroke-width="1.6" stroke-dasharray="4 4" />
      <path d="${toSvgPath(actualPoints)}" fill="none" stroke="#1f5ea8" stroke-width="3" />

      ${actualPoints
        .map((point, index) => {
          const isLatest = index === points.length - 1;
          const fillColor = isLatest ? latestColor : "#1f5ea8";
          const radius = isLatest ? 5.5 : 4;
          return `
            <circle
              cx="${point.x.toFixed(2)}"
              cy="${point.y.toFixed(2)}"
              r="${radius}"
              fill="${fillColor}"
              stroke="#ffffff"
              stroke-width="1.5"
            />
          `;
        })
        .join("")}

      ${points
        .map((point, index) => {
          const showLabel =
            points.length <= 6 ||
            index === 0 ||
            index === points.length - 1 ||
            index % Math.ceil(points.length / 5) === 0;

          if (!showLabel) return "";

          return `
            <text
              x="${xForIndex(index).toFixed(2)}"
              y="${viewBoxHeight - 18}"
              text-anchor="middle"
              font-size="10"
              fill="#5d6060"
            >
              ${escapeHtml(point.dateLabel)}
            </text>
          `;
        })
        .join("")}

      <text x="${marginLeft - 32}" y="${marginTop - 2}" text-anchor="start" font-size="11" fill="#5d6060">
        ${escapeHtml(unit)}
      </text>
    </svg>
  `;
}

async function svgMarkupToPngDataUrl(
  svgMarkup: string,
  targetWidth = 1600,
  targetHeight = 980
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("No se pudo obtener el contexto 2D para convertir grafico."));
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, targetWidth, targetHeight);
        context.drawImage(image, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL("image/png", 0.92));
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => reject(new Error("No se pudo convertir el grafico a imagen."));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
  });
}

function buildDiagnosisReportHtml(params: {
  generatedAt: string;
  documentTitle: string;
  reportTitle: string;
  reportIdentity: ReportIdentityMetadata;
  reportSections: ReportSectionData[];
  finalDiagnosisRows: ReportFieldRow[];
  recommendationRows: ReportFieldRow[];
  suggestedFoods: RecommendationFoodRow[];
  growthRows: ReportFieldRow[];
  chartAssets: ReportChartAsset[];
}): string {
  const {
    generatedAt,
    documentTitle,
    reportTitle,
    reportIdentity,
    reportSections,
    finalDiagnosisRows,
    recommendationRows,
    suggestedFoods,
    growthRows,
    chartAssets,
  } = params;

  const renderRowsTable = (rows: ReportFieldRow[]) => {
    if (!rows.length) {
      return `<p class="empty-note">No hay datos para esta seccion.</p>`;
    }

    return `
      <table>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <th>${escapeHtml(row.label)}</th>
                  <td>${escapeHtml(row.value)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;
  };

  const suggestedFoodsHtml = suggestedFoods.length
    ? `
      <table>
        <thead>
          <tr>
            <th>Alimento</th>
            <th>Categoria</th>
            <th>Porcion recomendada</th>
            <th>Frecuencia</th>
            <th>Edad ref.</th>
          </tr>
        </thead>
        <tbody>
          ${suggestedFoods
            .map(
              (food) => `
                <tr>
                  <td>${escapeHtml(food.foodName)}</td>
                  <td>${escapeHtml(food.category)}</td>
                  <td>${escapeHtml(food.portion)}</td>
                  <td>${escapeHtml(food.timesPerDay)}</td>
                  <td>${escapeHtml(food.referenceAge)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `
    : `<p class="empty-note">Sin alimentos sugeridos registrados.</p>`;

  const chartsHtml = chartAssets.length
    ? chartAssets
        .map((chart) => {
          const visual = chart.imageDataUrl
            ? `<img src="${chart.imageDataUrl}" alt="${escapeHtml(chart.title)}" class="chart-image" />`
            : chart.svgMarkup;

          return `
            <article class="chart-card">
              <h4>${escapeHtml(chart.title)}</h4>
              <div class="chart-visual">${visual}</div>
              <p class="chart-interpretation">${escapeHtml(chart.interpretation)}</p>
            </article>
          `;
        })
        .join("")
    : `<p class="empty-note">Sin graficos disponibles.</p>`;

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(documentTitle)}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #27323c;
            background: #fff;
            line-height: 1.35;
            font-size: 12px;
          }
          h1, h2, h3, h4, p { margin: 0; }
          h1 {
            font-size: 21px;
            color: #16354b;
            margin-bottom: 5px;
          }
          h2 {
            font-size: 15px;
            color: #194b66;
            margin-bottom: 8px;
          }
          h3 {
            font-size: 13px;
            color: #194b66;
            margin-bottom: 7px;
          }
          h4 {
            font-size: 12px;
            color: #1f2f3d;
            margin-bottom: 6px;
          }
          .meta {
            color: #5d6060;
            font-size: 11px;
            margin-bottom: 6px;
          }
          .report-section {
            border: 1px solid #d8dde2;
            border-radius: 10px;
            padding: 10px;
            margin-top: 10px;
            page-break-inside: avoid;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #d8dde2;
            padding: 6px;
            text-align: left;
            vertical-align: top;
            font-size: 11px;
          }
          th {
            width: 34%;
            background: #eef3f7;
            color: #31404d;
            font-weight: 700;
          }
          td {
            background: #fff;
          }
          .empty-note {
            color: #5d6060;
            font-size: 11px;
          }
          .chart-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
            margin-top: 8px;
          }
          .chart-card {
            border: 1px solid #d8dde2;
            border-radius: 8px;
            padding: 8px;
            page-break-inside: avoid;
          }
          .chart-visual {
            border: 1px solid #e8edf1;
            border-radius: 6px;
            overflow: hidden;
            background: #fff;
          }
          .chart-image {
            display: block;
            width: 100%;
            height: auto;
          }
          .chart-interpretation {
            margin-top: 6px;
            font-size: 11px;
            color: #394652;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>${escapeHtml(reportTitle)}</h1>
          <p class="meta">
            Consulta N° ${escapeHtml(reportIdentity.consultationNumber)} | Paciente: ${escapeHtml(
              reportIdentity.patientName
            )} | Fecha: ${escapeHtml(reportIdentity.consultationDate)}
          </p>
          <p class="meta">Generado: ${escapeHtml(generatedAt)}</p>
        </header>

        ${reportSections
          .map(
            (section) => `
              <section class="report-section">
                <h2>${escapeHtml(section.title)}</h2>
                ${renderRowsTable(section.rows)}
              </section>
            `
          )
          .join("")}

        <section class="report-section">
          <h2>Diagnóstico final</h2>
          ${renderRowsTable(finalDiagnosisRows)}
        </section>

        <section class="report-section">
          <h2>Recomendaciones</h2>
          ${renderRowsTable(recommendationRows)}
          <h3 style="margin-top:8px;">Alimentos sugeridos</h3>
          ${suggestedFoodsHtml}
        </section>

        <section class="report-section">
          <h2>Graficos de progreso antropometrico</h2>
          ${renderRowsTable(growthRows)}
          <div class="chart-grid">
            ${chartsHtml}
          </div>
        </section>
      </body>
    </html>
  `;
}

async function printReportHtmlFromHiddenFrame(reportHtml: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");

    let closed = false;
    const cleanup = () => {
      if (closed) return;
      closed = true;
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    iframe.onload = () => {
      const frameWindow = iframe.contentWindow;
      const frameDocument = iframe.contentDocument;
      if (!frameWindow || !frameDocument) {
        cleanup();
        reject(new Error("No se pudo iniciar el documento de impresion."));
        return;
      }

      const images = Array.from(frameDocument.images);
      const imagesReady = Promise.all(
        images.map(
          (image) =>
            new Promise<void>((imageReady) => {
              if (image.complete) {
                imageReady();
                return;
              }
              image.onload = () => imageReady();
              image.onerror = () => imageReady();
            })
        )
      );

      imagesReady
        .then(() => {
          let handled = false;
          const finalize = () => {
            if (handled) return;
            handled = true;
            cleanup();
            resolve();
          };

          frameWindow.addEventListener("afterprint", finalize, { once: true });
          frameWindow.focus();
          frameWindow.print();
          window.setTimeout(finalize, 2500);
        })
        .catch((error) => {
          cleanup();
          reject(error);
        });
    };

    document.body.appendChild(iframe);
    iframe.srcdoc = reportHtml;
  });
}

export const DiagnosisDocumentContent: React.FC = () => {
  const searchParams = useSearchParams();
  const highlightedPatientId = searchParams.get("patientId");
  const highlightedResultId = searchParams.get("resultId");
  const highlightedTab = searchParams.get("tab");
  const highlightedStep = Number(searchParams.get("step"));

  const normalizedHighlightedTab: DiagnosisTabId =
    highlightedTab === "results" ? "results" : "summary";
  const normalizedHighlightedStep =
    Number.isInteger(highlightedStep) &&
    highlightedStep >= 0 &&
    highlightedStep < RESULTS_STEPS.length
      ? highlightedStep
      : 0;

  const snapshot = useConsultationStore((s) => s.lastSavedConsultation);

  const [activeTab, setActiveTab] = useState<DiagnosisTabId>(normalizedHighlightedTab);
  const [query, setQuery] = useState("");
  const [consultationDateFilter, setConsultationDateFilter] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    highlightedPatientId
  );
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [resultsStep, setResultsStep] = useState(normalizedHighlightedStep);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(highlightedResultId);
  const [expandedGrowthIndicatorId, setExpandedGrowthIndicatorId] = useState<GrowthIndicatorId | null>(
    null
  );
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const diagnosisResults = useMemo(() => {
    const historicalRecords: DiagnosisResult[] = [];

    for (const diagnosis of db.diagnoses) {
      const consultation = db.consultations.find(
        (item) => item.consultationId === diagnosis.consultationId
      );
      if (!consultation) continue;

      const resultPatient = db.patients.find((item) => item.patientId === consultation.patientId);
      if (!resultPatient) continue;

      const user = db.users.find((item) => item.userId === resultPatient.userId);
      if (!user) continue;

      const consultationClinician = db.clinicians.find(
        (item) => item.clinicianId === consultation.clinicianId
      );
      const consultationClinicianUser = consultationClinician
        ? db.users.find((item) => item.userId === consultationClinician.userId) ?? null
        : null;

      const ageMonths = calculateAgeInMonths(resultPatient.birthDate, consultation.date);

      historicalRecords.push({
        id: diagnosis.diagnosisId,
        source: "history",
        patientId: resultPatient.patientId,
        patientName: `${user.firstName} ${user.lastName}`,
        attendedByName: consultationClinicianUser
          ? `${consultationClinicianUser.firstName} ${consultationClinicianUser.lastName}`
          : "Sin dato",
        identityNumber: user.identityNumber,
        ageMonths,
        nutritionalStatus: diagnosis.nutritionalDiagnosis || "Sin clasificar",
        dateValue: consultation.date.getTime(),
        dateKey: formatDateKey(consultation.date),
        dateLabel: consultation.date.toLocaleDateString("es-BO"),
        diagnosisDetails: diagnosis.diagnosisDetails,
        bmi: diagnosis.bmi,
        zScore: diagnosis.zScorePercentile,
      });
    }

    if (!snapshot) {
      return historicalRecords.sort((a, b) => b.dateValue - a.dateValue);
    }

    const snapshotPatient = db.patients.find((item) => item.patientId === snapshot.patientId);
    const snapshotUser = snapshotPatient
      ? db.users.find((item) => item.userId === snapshotPatient.userId)
      : null;
    const snapshotClinicianLink = snapshotPatient
      ? db.patientClinicians.find((item) => item.patientId === snapshotPatient.patientId) ?? null
      : null;
    const snapshotClinician = snapshotClinicianLink
      ? db.clinicians.find((item) => item.clinicianId === snapshotClinicianLink.clinicianId) ?? null
      : null;
    const snapshotClinicianUser = snapshotClinician
      ? db.users.find((item) => item.userId === snapshotClinician.userId) ?? null
      : null;

    const snapshotRecord: DiagnosisResult = {
      id: `snapshot-${snapshot.savedAt}`,
      source: "last_consultation",
      patientId: snapshot.patientId,
      patientName: snapshotUser
        ? `${snapshotUser.firstName} ${snapshotUser.lastName}`
        : `${snapshotPatient?.firstName ?? ""} ${snapshotPatient?.lastName ?? ""}`.trim() ||
          "Paciente",
      attendedByName: snapshotClinicianUser
        ? `${snapshotClinicianUser.firstName} ${snapshotClinicianUser.lastName}`
        : "Profesional en consulta",
      identityNumber: snapshotUser?.identityNumber ?? snapshotPatient?.identityNumber ?? "Sin dato",
      ageMonths: snapshotPatient ? calculateAgeInMonths(snapshotPatient.birthDate, snapshot.savedAt) : 0,
      nutritionalStatus: deriveStatusFromMetrics(
        snapshot.anthropometric.bmi,
        snapshot.anthropometric.zScore
      ),
      dateValue: new Date(snapshot.savedAt).getTime(),
      dateKey: formatDateKey(snapshot.savedAt),
      dateLabel: formatDateTime(snapshot.savedAt),
      diagnosisDetails:
        "Registro generado desde la nueva consulta, pendiente de analisis final.",
      bmi: snapshot.anthropometric.bmi,
      zScore: snapshot.anthropometric.zScore,
    };

    return [snapshotRecord, ...historicalRecords].sort((a, b) => b.dateValue - a.dateValue);
  }, [snapshot]);

  const selectablePatients = useMemo(() => {
    return db.patients
      .map((patient) => {
        const name = `${patient.firstName} ${patient.lastName}`;
        const ageMonths = calculateAgeInMonths(patient.birthDate);
        const matchingRecords = diagnosisResults.filter(
          (item) =>
            item.patientId === patient.patientId &&
            (!consultationDateFilter || item.dateKey === consultationDateFilter)
        );

        return {
          patientId: patient.patientId,
          name,
          identityNumber: patient.identityNumber,
          ageMonths,
          matchingRecordsCount: matchingRecords.length,
        };
      })
      .filter((patient) => patient.matchingRecordsCount > 0);
  }, [diagnosisResults, consultationDateFilter]);

  const filteredPatients = useMemo(() => {
    if (query.trim().length < 3) return [];

    const normalizedQuery = normalizeText(query.trim());

    return selectablePatients.filter((patient) => {
      return (
        normalizeText(patient.name).includes(normalizedQuery) ||
        normalizeText(patient.identityNumber).includes(normalizedQuery)
      );
    });
  }, [query, selectablePatients]);

  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return db.patients.find((patient) => patient.patientId === selectedPatientId) ?? null;
  }, [selectedPatientId]);

  const selectedPatientAgeMonths = useMemo(
    () => (selectedPatient ? calculateAgeInMonths(selectedPatient.birthDate) : null),
    [selectedPatient]
  );
  const isSelectedPatientInTargetAge =
    selectedPatientAgeMonths !== null && isTargetPediatricAge(selectedPatientAgeMonths);

  const selectedPatientUser = useMemo(
    () =>
      selectedPatient
        ? db.users.find((item) => item.userId === selectedPatient.userId) ?? null
        : null,
    [selectedPatient]
  );

  const selectedGuardian = useMemo(
    () =>
      selectedPatient
        ? db.guardians.find((item) => item.patientId === selectedPatient.patientId) ?? null
        : null,
    [selectedPatient]
  );
  const selectedGuardianName = selectedGuardian
    ? `${selectedGuardian.firstName} ${selectedGuardian.lastName}`
    : "Sin dato";

  const selectedPatientResults = useMemo(() => {
    if (!selectedPatientId) return [];

    return diagnosisResults.filter((item) => {
      const patientMatch = item.patientId === selectedPatientId;
      const dateMatch = !consultationDateFilter || item.dateKey === consultationDateFilter;
      return patientMatch && dateMatch;
    });
  }, [diagnosisResults, selectedPatientId, consultationDateFilter]);

  const selectedConsultationResult = useMemo(() => {
    if (!selectedResultId) return null;
    return selectedPatientResults.find((item) => item.id === selectedResultId) ?? null;
  }, [selectedPatientResults, selectedResultId]);

  useEffect(() => {
    if (!highlightedPatientId) return;

    setExpandedGrowthIndicatorId(null);
    setSelectedPatientId(highlightedPatientId);
    setSelectedResultId(highlightedResultId);
    setActiveTab(normalizedHighlightedTab);
    setResultsStep(normalizedHighlightedStep);
    setQuery("");
    setHighlightedIndex(0);
  }, [
    highlightedPatientId,
    highlightedResultId,
    normalizedHighlightedTab,
    normalizedHighlightedStep,
  ]);

  const snapshotForSummary = useMemo(() => {
    if (!snapshot) return null;
    if (!selectedPatientId) return null;
    if (!selectedConsultationResult) return null;
    if (selectedConsultationResult.source !== "last_consultation") return null;
    if (snapshot.patientId !== selectedPatientId) return null;

    const snapshotId = `snapshot-${snapshot.savedAt}`;
    if (snapshotId !== selectedConsultationResult.id) return null;

    if (consultationDateFilter && formatDateKey(snapshot.savedAt) !== consultationDateFilter) {
      return null;
    }
    return snapshot;
  }, [snapshot, selectedPatientId, consultationDateFilter, selectedConsultationResult]);

  const selectedConsultationDetail = useMemo(() => {
    if (!selectedConsultationResult) {
      return "No hay informacion disponible para la consulta seleccionada.";
    }

    if (selectedConsultationResult.source === "last_consultation" && snapshotForSummary) {
      const findings = [
        `Paciente ${selectedConsultationResult.patientName}.`,
        `Motivo de consulta: ${formatValue(snapshotForSummary.clinical.mainConsultationReason)}.`,
        `IMC ${formatValue(snapshotForSummary.anthropometric.bmi)} y Puntaje Z ${formatValue(
          snapshotForSummary.anthropometric.zScore
        )}.`,
        `Senales de alarma actuales: ${formatValue(snapshotForSummary.clinical.alarmSigns)}.`,
        `Sintomas digestivos: diarrea ${formatValue(
          snapshotForSummary.clinical.diarrhea
        )}, vomitos ${formatValue(snapshotForSummary.clinical.vomiting)}, deshidratacion ${formatValue(
          snapshotForSummary.clinical.dehydration
        )}.`,
        `Sueno: ${formatValue(snapshotForSummary.historical.sleepQuality)} (${formatValue(
          snapshotForSummary.historical.sleepAverageHours
        )} hrs).`,
      ];

      return findings.join(" ");
    }

    return (
      selectedConsultationResult.diagnosisDetails ||
      "No se registró un diagnóstico detallado para esta consulta."
    );
  }, [selectedConsultationResult, snapshotForSummary]);

  const recommendationData = useMemo(() => {
    if (!selectedPatient || !selectedConsultationResult) return null;

    const referenceHistoricalDiagnosis =
      selectedConsultationResult.source === "history"
        ? selectedConsultationResult
        : selectedPatientResults.find((item) => item.source === "history") ?? null;

    const persistedRecommendation = referenceHistoricalDiagnosis
      ? db.recommendations.find(
          (recommendation) => recommendation.diagnosisId === referenceHistoricalDiagnosis.id
        ) ?? null
      : null;

    const linkedFoods: RecommendationFoodRow[] = persistedRecommendation
      ? db.recommendationFoods
          .filter(
            (recommendationFood) =>
              recommendationFood.recommendationId === persistedRecommendation.recommendationId
          )
          .map((recommendationFood) => {
            const food = db.foods.find((item) => item.foodId === recommendationFood.foodId);
            if (!food) return null;

            return {
              foodId: food.foodId,
              foodName: translateFoodName(food.foodName),
              category: translateFoodCategory(food.category),
              portion: translatePortionText(recommendationFood.dailyAmount),
              timesPerDay: inferTimesPerDay(recommendationFood.dailyAmount),
              referenceAge: translateReferenceAge(recommendationFood.referenceAge),
              energyKcal: food.energyKcal,
              proteinG: food.proteinG,
              fatG: food.fatG,
              carbohydratesG: food.carbohydratesG,
              fiberG: food.fiberG,
              vitamins: food.vitamins,
              minerals: food.minerals,
            };
          })
          .filter((item): item is RecommendationFoodRow => item !== null)
      : [];

    const fallbackReferenceAge =
      selectedPatientAgeMonths !== null
        ? formatPediatricAge(selectedPatientAgeMonths)
        : "6-60 meses";

    const fallbackFoods: RecommendationFoodRow[] = db.foods.slice(0, 5).map((food) => ({
      foodId: food.foodId,
      foodName: translateFoodName(food.foodName),
      category: translateFoodCategory(food.category),
      portion: "Porcion sugerida según tolerancia y edad",
      timesPerDay: "1 vez/dia",
      referenceAge: fallbackReferenceAge,
      energyKcal: food.energyKcal,
      proteinG: food.proteinG,
      fatG: food.fatG,
      carbohydratesG: food.carbohydratesG,
      fiberG: food.fiberG,
      vitamins: food.vitamins,
      minerals: food.minerals,
    }));

    return {
      medicalText:
        persistedRecommendation?.medicalRecommendation ??
        buildDefaultMedicalRecommendation(selectedConsultationResult.nutritionalStatus),
      dietaryText:
        persistedRecommendation?.dietaryRecommendation ??
        buildDefaultDietaryRecommendation(selectedConsultationResult.nutritionalStatus),
      foodRows: linkedFoods.length ? linkedFoods : fallbackFoods,
      restrictedFoodGroups: getDiagnosisRestrictedFoodGroups(
        selectedConsultationResult.nutritionalStatus
      ),
      hasPersistedRecommendation: Boolean(persistedRecommendation),
    };
  }, [
    selectedConsultationResult,
    selectedPatient,
    selectedPatientAgeMonths,
    selectedPatientResults,
  ]);

  const anthropometricTrendRows = useMemo(() => {
    if (!selectedPatient) return [];

    const historicalRows: AnthropometricTrendRow[] = db.consultations
      .filter((consultation) => consultation.patientId === selectedPatient.patientId)
      .map((consultation) => {
        const anthropometric = db.anthropometricData.find(
          (item) => item.consultationId === consultation.consultationId
        );
        if (!anthropometric) return null;

        return {
          id: consultation.consultationId,
          dateValue: consultation.date.getTime(),
          dateKey: formatDateKey(consultation.date),
          dateLabel: consultation.date.toLocaleDateString("es-BO"),
          ageMonths: calculateAgeInMonths(selectedPatient.birthDate, consultation.date),
          weightKg: anthropometric.weightKg,
          heightCm: Number((anthropometric.heightM * 100).toFixed(1)),
          muacCm: anthropometric.muacCm,
          headCircumferenceCm: anthropometric.headCircumferenceCm,
        };
      })
      .filter((item): item is AnthropometricTrendRow => item !== null);

    const hasSnapshotForSelectedPatient =
      snapshot && snapshot.patientId === selectedPatient.patientId;

    const snapshotRows: AnthropometricTrendRow[] = hasSnapshotForSelectedPatient
      ? [
          {
            id: `snapshot-${snapshot.savedAt}`,
            dateValue: new Date(snapshot.savedAt).getTime(),
            dateKey: formatDateKey(snapshot.savedAt),
            dateLabel: new Date(snapshot.savedAt).toLocaleDateString("es-BO"),
            ageMonths: calculateAgeInMonths(selectedPatient.birthDate, snapshot.savedAt),
            weightKg: snapshot.anthropometric.weightKg ?? Number.NaN,
            heightCm:
              snapshot.anthropometric.heightM !== undefined
                ? Number((snapshot.anthropometric.heightM * 100).toFixed(1))
                : Number.NaN,
            muacCm: snapshot.anthropometric.muacCm ?? Number.NaN,
            headCircumferenceCm:
              snapshot.anthropometric.headCircumferenceCm ?? Number.NaN,
          },
        ]
      : [];

    const merged = [...historicalRows, ...snapshotRows].sort(
      (a, b) => a.dateValue - b.dateValue
    );

    const rowsByDate = consultationDateFilter
      ? merged.filter((row) => row.dateKey === consultationDateFilter)
      : merged;

    return rowsByDate;
  }, [consultationDateFilter, selectedPatient, snapshot]);

  const growthIndicators = useMemo(() => {
    return PEDIATRIC_GROWTH_INDICATORS.map((indicator) => {
      const points = anthropometricTrendRows
        .map((row) => {
          const actualValue = indicator.getActualValue(row);
          if (!Number.isFinite(actualValue)) return null;

          const percentileProfile = indicator.getReferenceProfile(row);
          const percentile = estimatePercentileFromProfile(actualValue, percentileProfile);
          const zScore = estimateZScoreFromPercentiles(actualValue, percentileProfile);

          return {
            dateLabel: row.dateLabel,
            ageLabel: formatPediatricAge(row.ageMonths),
            actual: actualValue,
            percentiles: percentileProfile,
            zone: getZoneFromPercentile(percentile),
            percentile,
            zScore,
          } satisfies AnthropometricTrendPoint;
        })
        .filter((point): point is AnthropometricTrendPoint => point !== null);

      if (!points.length) return null;

      const latestPoint = points[points.length - 1];
      const previousPoint = points.length > 1 ? points[points.length - 2] : null;
      const percentileDelta = previousPoint
        ? Number((latestPoint.percentile - previousPoint.percentile).toFixed(1))
        : 0;
      const zDelta = previousPoint
        ? Number((latestPoint.zScore - previousPoint.zScore).toFixed(2))
        : 0;
      const hasCurveDrop = previousPoint ? percentileDelta <= -10 || zDelta <= -0.7 : false;
      const statusLabel = buildIndicatorStatusLabel(indicator.id, latestPoint.zScore, hasCurveDrop);

      return {
        id: indicator.id,
        title: indicator.title,
        shortTitle: indicator.shortTitle,
        unit: indicator.unit,
        description: indicator.description,
        points,
        latestPoint,
        statusLabel,
        interpretation: buildIndicatorInterpretation(
          indicator.title,
          indicator.unit,
          latestPoint,
          previousPoint,
          statusLabel
        ),
        tone: latestPoint.zone,
        percentileDelta,
        zDelta,
        hasCurveDrop,
      } satisfies GrowthIndicatorAssessment;
    }).filter((indicator): indicator is GrowthIndicatorAssessment => indicator !== null);
  }, [anthropometricTrendRows]);

  const expandedGrowthIndicator = useMemo(() => {
    if (!expandedGrowthIndicatorId) return null;
    return growthIndicators.find((indicator) => indicator.id === expandedGrowthIndicatorId) ?? null;
  }, [expandedGrowthIndicatorId, growthIndicators]);

  useEffect(() => {
    if (!expandedGrowthIndicator) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [expandedGrowthIndicator]);

  useEffect(() => {
    if (!expandedGrowthIndicator) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpandedGrowthIndicatorId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expandedGrowthIndicator]);

  const growthOverview = useMemo(() => {
    return buildGrowthOverview(growthIndicators);
  }, [growthIndicators]);

  const latestTrendAgeMonths = useMemo(() => {
    if (anthropometricTrendRows.length > 0) {
      return anthropometricTrendRows[anthropometricTrendRows.length - 1].ageMonths;
    }

    if (selectedConsultationResult) {
      return selectedConsultationResult.ageMonths;
    }

    return selectedPatientAgeMonths;
  }, [anthropometricTrendRows, selectedConsultationResult, selectedPatientAgeMonths]);

  const automatedFollowUpRecommendations = useMemo(() => {
    return buildAutomatedFollowUpRecommendations({
      ageMonths: latestTrendAgeMonths,
      overview: growthOverview,
      indicators: growthIndicators,
    });
  }, [growthIndicators, growthOverview, latestTrendAgeMonths]);

  const handleSelectPatient = (patientId: string) => {
    setExpandedGrowthIndicatorId(null);
    setSelectedPatientId(patientId);
    setSelectedResultId(null);
    setActiveTab("summary");
    setResultsStep(0);
    setQuery("");
    setHighlightedIndex(0);
  };

  const handleClearSelection = () => {
    setExpandedGrowthIndicatorId(null);
    setSelectedPatientId(null);
    setSelectedResultId(null);
    setActiveTab("summary");
    setResultsStep(0);
    setQuery("");
    setHighlightedIndex(0);
  };

  const handleConsultationDateChange = (value: string) => {
    setExpandedGrowthIndicatorId(null);
    setConsultationDateFilter(value);
    setSelectedResultId(null);
    setActiveTab("summary");
    setResultsStep(0);
  };

  const handleSelectResult = (resultId: string) => {
    setExpandedGrowthIndicatorId(null);
    setSelectedResultId(resultId);
    setActiveTab("summary");
    setResultsStep(0);
  };

  const handleOpenExpandedChart = (indicatorId: GrowthIndicatorId) => {
    setExpandedGrowthIndicatorId(indicatorId);
  };

  const handleCloseExpandedChart = () => {
    setExpandedGrowthIndicatorId(null);
  };

  const handleGeneratePdfReport = async () => {
    if (!selectedConsultationResult || isGeneratingReport) return;

    setIsGeneratingReport(true);
    try {
      const generatedAt = new Intl.DateTimeFormat("es-BO", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date());

      const diagnosisRecordForReport =
        selectedConsultationResult.source === "history"
          ? db.diagnoses.find((item) => item.diagnosisId === selectedConsultationResult.id) ?? null
          : null;

      const consultationRecordForReport = diagnosisRecordForReport
        ? db.consultations.find((item) => item.consultationId === diagnosisRecordForReport.consultationId) ?? null
        : null;

      const consultationCode = consultationRecordForReport?.consultationId ?? selectedConsultationResult.id;
      const consultationNumber =
        inferConsultationNumberFromId(consultationCode) ??
        (selectedConsultationResult.source === "last_consultation"
          ? "Sin asignar"
          : consultationCode);

      const reportIdentity: ReportIdentityMetadata = {
        consultationNumber,
        patientName: selectedConsultationResult.patientName,
        consultationDate: selectedConsultationResult.dateLabel,
      };

      const reportSections: ReportSectionData[] = [];

      const patientAndGuardianRows: ReportFieldRow[] = [
        { label: "Número de consulta", value: reportIdentity.consultationNumber },
        { label: "Paciente", value: selectedConsultationResult.patientName },
        { label: "Cedula de identidad", value: selectedConsultationResult.identityNumber },
        { label: "Guardián / responsable", value: selectedGuardianName },
        {
          label: "Edad al momento de la consulta",
          value: formatPediatricAge(selectedConsultationResult.ageMonths),
        },
        { label: "Fecha de consulta", value: selectedConsultationResult.dateLabel },
        { label: "Atendido por", value: selectedConsultationResult.attendedByName },
      ];

      reportSections.push({
        title: "Paciente y responsable",
        rows: patientAndGuardianRows,
      });

      if (snapshotForSummary) {
        reportSections.push({
          title: "Datos antropometricos",
          rows: [
            { label: "Peso (kg)", value: formatValue(snapshotForSummary.anthropometric.weightKg) },
            { label: "Talla (m)", value: formatValue(snapshotForSummary.anthropometric.heightM) },
            { label: "Perimetro braquial (cm)", value: formatValue(snapshotForSummary.anthropometric.muacCm) },
            {
              label: "Perimetro cefalico (cm)",
              value: formatValue(snapshotForSummary.anthropometric.headCircumferenceCm),
            },
            { label: "IMC", value: formatValue(snapshotForSummary.anthropometric.bmi) },
            { label: "Puntaje Z", value: formatValue(snapshotForSummary.anthropometric.zScore) },
            { label: "Percentil", value: formatValue(snapshotForSummary.anthropometric.percentile) },
          ],
        });

        reportSections.push({
          title: "Datos clínicos",
          rows: [
            { label: "Motivo principal de consulta", value: formatValue(snapshotForSummary.clinical.mainConsultationReason) },
            { label: "Quien brinda la informacion", value: formatValue(snapshotForSummary.clinical.informantType) },
            { label: "Nombre del informante", value: formatValue(snapshotForSummary.clinical.informantName) },
            {
              label: "Parentesco del informante",
              value: formatValue(snapshotForSummary.clinical.informantRelationship),
            },
            { label: "Senales de alarma actuales", value: formatValue(snapshotForSummary.clinical.alarmSigns) },
            { label: "Peso al nacer (kg)", value: formatValue(snapshotForSummary.clinical.birthWeightKg) },
            {
              label: "Edad gestacional al nacer (semanas)",
              value: formatValue(snapshotForSummary.clinical.gestationalAgeWeeks),
            },
            { label: "Prematuridad", value: formatValue(snapshotForSummary.clinical.prematurity) },
            { label: "Nivel de actividad", value: formatValue(snapshotForSummary.clinical.activityLevel) },
            { label: "Presencia de desanimo", value: formatValue(snapshotForSummary.clinical.apathy) },
            { label: "Observaciones generales", value: formatValue(snapshotForSummary.clinical.generalObservations) },
            { label: "Cabello", value: formatValue(snapshotForSummary.clinical.hairCondition) },
            { label: "Piel", value: formatValue(snapshotForSummary.clinical.skinCondition) },
            { label: "Edema", value: formatValue(snapshotForSummary.clinical.edema) },
            { label: "Edema bilateral (grado)", value: formatValue(snapshotForSummary.clinical.bilateralEdemaGrade) },
            { label: "Denticion", value: formatValue(snapshotForSummary.clinical.dentition) },
            { label: "Observaciones fisicas", value: formatValue(snapshotForSummary.clinical.physicalObservations) },
            { label: "Diarrea", value: formatValue(snapshotForSummary.clinical.diarrhea) },
            { label: "Vomitos", value: formatValue(snapshotForSummary.clinical.vomiting) },
            { label: "Signos de deshidratacion", value: formatValue(snapshotForSummary.clinical.dehydration) },
            { label: "Observaciones digestivas", value: formatValue(snapshotForSummary.clinical.digestiveObservations) },
            { label: "Temperatura (C)", value: formatValue(snapshotForSummary.clinical.temperatureCelsius) },
            { label: "Observacion de temperatura", value: formatValue(snapshotForSummary.clinical.temperatureObservation) },
            { label: "Frecuencia cardiaca (lpm)", value: formatValue(snapshotForSummary.clinical.heartRate) },
            {
              label: "Observacion de frecuencia cardiaca",
              value: formatValue(snapshotForSummary.clinical.heartRateObservation),
            },
            { label: "Frecuencia respiratoria (rpm)", value: formatValue(snapshotForSummary.clinical.respiratoryRate) },
            {
              label: "Observacion de frecuencia respiratoria",
              value: formatValue(snapshotForSummary.clinical.respiratoryRateObservation),
            },
            { label: "Presion sistolica (mmHg)", value: formatValue(snapshotForSummary.clinical.bloodPressureSystolic) },
            { label: "Presion diastolica (mmHg)", value: formatValue(snapshotForSummary.clinical.bloodPressureDiastolic) },
            { label: "Presion arterial", value: formatValue(snapshotForSummary.clinical.bloodPressure) },
            {
              label: "Observacion de presion arterial",
              value: formatValue(snapshotForSummary.clinical.bloodPressureObservation),
            },
          ],
        });

        reportSections.push({
          title: "Datos historicos",
          rows: [
            { label: "Lactancia materna", value: formatValue(snapshotForSummary.historical.breastfeeding) },
            { label: "Uso de biberon", value: formatValue(snapshotForSummary.historical.bottleFeeding) },
            { label: "Frecuencia de biberon", value: formatValue(snapshotForSummary.historical.feedingFrequency) },
            {
              label: "Inicio de alimentacion complementaria (meses)",
              value: formatValue(snapshotForSummary.historical.complementaryFeedingStartMonths),
            },
            {
              label: "Frecuencia por grupo de alimentos",
              value: foodMatrixEntries.length
                ? foodMatrixEntries
                    .map(([groupId, frequency]) => `${FOOD_GROUP_LABELS[groupId]}: ${frequency}`)
                    .join(" | ")
                : "Sin dato",
            },
            { label: "Comidas por dia", value: formatValue(snapshotForSummary.historical.mealsPerDay) },
            {
              label: "Horarios habituales",
              value: mealScheduleEntries.length
                ? mealScheduleEntries.map(([slotId, hour]) => `${MEAL_SLOT_LABELS[slotId]} ${hour}`).join(" | ")
                : "Sin dato",
            },
            {
              label: "Recordatorio 24h (desayuno/almuerzo/cena/snacks)",
              value: recall24hEntries.length
                ? recall24hEntries.map(([slotId, value]) => `${RECALL_SLOT_LABELS[slotId]}: ${value}`).join(" | ")
                : "Sin dato",
            },
            { label: "Azucar/sal añadida", value: formatValue(snapshotForSummary.historical.addedSugarSalt) },
            {
              label: "Frecuencia de azucar/sal añadida",
              value: formatValue(snapshotForSummary.historical.addedSugarSaltFrequency),
            },
            { label: "Apetito", value: formatValue(snapshotForSummary.historical.appetiteLevel) },
            { label: "Vasos de agua por dia", value: formatValue(snapshotForSummary.historical.waterGlassesPerDay) },
            {
              label: "Alergias/intolerancias alimentarias",
              value: formatValue(snapshotForSummary.historical.foodAllergiesOrIntolerances),
            },
            { label: "Suplementacion actual", value: formatValue(snapshotForSummary.historical.currentSupplementation) },
            {
              label: "Suplementacion (otros)",
              value: formatValue(snapshotForSummary.historical.currentSupplementationOther),
            },
            { label: "Desparasitación (última fecha)", value: formatValue(snapshotForSummary.historical.dewormingLastDate) },
            { label: "Medicamentos actuales", value: formatValue(snapshotForSummary.historical.currentMedications) },
            { label: "Enfermedades recientes", value: formatValue(snapshotForSummary.historical.recentIllnesses) },
            {
              label: "Otros antecedentes recientes",
              value: formatValue(snapshotForSummary.historical.recentIllnessesOther),
            },
            { label: "Estado de vacunacion", value: formatValue(snapshotForSummary.historical.vaccinationStatus) },
            { label: "Acceso a agua segura", value: formatValue(snapshotForSummary.historical.safeWaterAccess) },
            { label: "Saneamiento basico", value: formatValue(snapshotForSummary.historical.basicSanitation) },
            {
              label: "Inseguridad alimentaria: faltaron alimentos en casa",
              value: formatValue(snapshotForSummary.historical.foodInsecurityConcern),
            },
            {
              label: "Inseguridad alimentaria: reduccion/omision de comidas",
              value: formatValue(snapshotForSummary.historical.foodInsecurityMealSkip),
            },
            { label: "Cuidador principal", value: formatValue(snapshotForSummary.historical.primaryCaregiver) },
            { label: "Asistencia a guarderia", value: formatValue(snapshotForSummary.historical.daycareAttendance) },
            { label: "Horas promedio de sueno", value: formatValue(snapshotForSummary.historical.sleepAverageHours) },
            { label: "Calidad de sueno", value: formatValue(snapshotForSummary.historical.sleepQuality) },
            { label: "Hora de acostarse", value: formatValue(snapshotForSummary.historical.bedtime) },
            { label: "Hora de levantarse", value: formatValue(snapshotForSummary.historical.wakeupTime) },
          ],
        });
      } else {
        const anthropometricRecord = consultationRecordForReport
          ? db.anthropometricData.find((item) => item.consultationId === consultationRecordForReport.consultationId) ?? null
          : null;

        const clinicalRecord = consultationRecordForReport
          ? db.clinicalData.find((item) => item.consultationId === consultationRecordForReport.consultationId) ?? null
          : null;

        const antecedentsRecord = consultationRecordForReport
          ? db.antecedents.find((item) => item.consultationId === consultationRecordForReport.consultationId) ?? null
          : null;

        if (anthropometricRecord) {
          reportSections.push({
            title: "Datos antropometricos",
            rows: [
              ...buildRowsFromRecord(anthropometricRecord, {
                anthropometricDataId: "ID antropometrico",
                consultationId: "ID consulta",
                weightKg: "Peso (kg)",
                heightM: "Talla (m)",
                muacCm: "Perimetro braquial (cm)",
                headCircumferenceCm: "Perimetro cefalico (cm)",
              }),
              { label: "IMC", value: formatValue(selectedConsultationResult.bmi) },
              { label: "Puntaje Z / Percentil", value: formatValue(selectedConsultationResult.zScore) },
            ],
          });
        }

        if (clinicalRecord) {
          reportSections.push({
            title: "Datos clínicos",
            rows: buildRowsFromRecord(clinicalRecord, {
              activityLevel: "Nivel de actividad",
              apathy: "Desanimo",
              hairCondition: "Cabello",
              skinCondition: "Piel",
              edema: "Edema",
              dentition: "Denticion",
              observations: "Observaciones",
              temperatureCelsius: "Temperatura (C)",
            }),
          });
        }

        if (antecedentsRecord) {
          reportSections.push({
            title: "Datos historicos",
            rows: buildRowsFromRecord(antecedentsRecord, {
              breastfeeding: "Lactancia materna",
              bottleFeeding: "Uso de biberon",
              feedingFrequency: "Frecuencia de alimentacion",
              complementaryFeedingStart: "Inicio de alimentacion complementaria",
              consumedFoods: "Alimentos consumidos",
              dailyFoodQuantity: "Cantidad diaria de alimentos",
              recentIllnesses: "Enfermedades recientes",
              vaccinationStatus: "Estado de vacunacion",
              averageSleepHours: "Horas promedio de sueno",
              sleepRoutine: "Rutina de sueno",
              observations: "Observaciones",
            }),
          });
        }
      }

      const finalDiagnosisRows: ReportFieldRow[] = [
        { label: "Estado nutricional", value: selectedConsultationResult.nutritionalStatus },
        { label: "Detalle diagnóstico", value: selectedConsultationDetail },
        { label: "IMC", value: formatValue(selectedConsultationResult.bmi) },
        { label: "Puntaje Z / Percentil", value: formatValue(selectedConsultationResult.zScore) },
      ];

      const recommendationRows: ReportFieldRow[] = [
        {
          label: "Recomendaciones médicas",
          value: recommendationData?.medicalText ?? "Sin recomendaciones médicas registradas.",
        },
        {
          label: "Recomendaciones alimentarias",
          value: recommendationData?.dietaryText ?? "Sin recomendaciones alimentarias registradas.",
        },
        {
          label: "Seguimiento automatizado",
          value: automatedFollowUpRecommendations.length
            ? automatedFollowUpRecommendations.join(" ")
            : "Sin recomendaciones de seguimiento adicionales.",
        },
      ];

      const growthRows: ReportFieldRow[] = growthIndicators.length
        ? growthIndicators.map((indicator) => ({
            label: indicator.title,
            value: `${indicator.latestPoint.actual.toFixed(2)} ${indicator.unit} | Percentil ${indicator.latestPoint.percentile.toFixed(
              1
            )} | Puntaje Z ${indicator.latestPoint.zScore.toFixed(2)} | Estado ${indicator.statusLabel}`,
          }))
        : [{ label: "Progreso", value: "Sin datos antropometricos para mostrar." }];

      const chartAssets: ReportChartAsset[] = await Promise.all(
        growthIndicators.map(async (indicator) => {
          const svgMarkup = buildGrowthChartSvgMarkup(indicator.title, indicator.unit, indicator.points);
          try {
            const imageDataUrl = await svgMarkupToPngDataUrl(svgMarkup);
            return {
              title: indicator.title,
              interpretation: indicator.interpretation,
              svgMarkup,
              imageDataUrl,
            };
          } catch {
            return {
              title: indicator.title,
              interpretation: indicator.interpretation,
              svgMarkup,
            };
          }
        })
      );

      const documentDateToken =
        selectedConsultationResult.dateKey || formatDateKey(new Date()) || "SinFecha";
      const documentTitle = `Informe_Consulta_${toSafeFileToken(reportIdentity.consultationNumber)}_${toSafeFileToken(
        reportIdentity.patientName
      )}_${toSafeFileToken(documentDateToken)}`;

      const reportHtml = buildDiagnosisReportHtml({
        generatedAt,
        documentTitle,
        reportTitle: "Informe de Diagnóstico Pediátrico",
        reportIdentity,
        reportSections,
        finalDiagnosisRows,
        recommendationRows,
        suggestedFoods: recommendationData?.foodRows ?? [],
        growthRows,
        chartAssets,
      });

      await printReportHtmlFromHiddenFrame(reportHtml);
    } catch (error) {
      console.error("Error generando el informe PDF:", error);
      window.alert("No se pudo generar el informe. Intenta nuevamente.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleChangeSelectedConsultation = () => {
    setExpandedGrowthIndicatorId(null);
    setSelectedResultId(null);
    setActiveTab("summary");
    setResultsStep(0);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredPatients.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current < filteredPatients.length - 1 ? current + 1 : 0
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current > 0 ? current - 1 : filteredPatients.length - 1
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const next = filteredPatients[highlightedIndex];
      if (next) handleSelectPatient(next.patientId);
      return;
    }

    if (event.key === "Escape") {
      setQuery("");
      setHighlightedIndex(0);
    }
  };
  const foodMatrixEntries = Object.entries(snapshotForSummary?.historical.foodFrequencyByGroup ?? {}) as Array<
    [HistoricalFoodGroupId, string]
  >;

  const mealScheduleEntries = Object.entries(snapshotForSummary?.historical.mealSchedule ?? {}) as Array<
    [HistoricalMealSlotId, string]
  >;
  const recall24hEntries = Object.entries(snapshotForSummary?.historical.recall24h ?? {}) as Array<
    [HistoricalRecallSlotId, string]
  >;

  return (
    <div className="nutri-clinician-page px-1 py-1 sm:px-2">
      <Heading
        containerClassName="nutri-clinician-page-header p-4 sm:p-5"
        description="Busca al paciente, selecciona la consulta y revisa resumen, resultados y progresion antropometrica."
      >
        Diagnóstico del paciente
      </Heading>

      <section className="nutri-clinician-surface p-4 sm:p-5">
        <div className="mt-2 flex flex-col gap-4 sm:mt-4 sm:flex-row sm:items-end sm:gap-6">
          <div className="relative w-full max-w-xl" onKeyDown={handleSearchKeyDown}>
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Buscar por nombre del paciente o CI"
            />

            {query.trim().length >= 3 && filteredPatients.length > 0 && (
              <ul
                role="listbox"
                className="nutri-clinician-surface absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-nutri-light-grey bg-nutri-white shadow-md"
              >
                {filteredPatients.map((patientOption, index) => (
                  <li
                    key={patientOption.patientId}
                    role="option"
                    aria-selected={index === highlightedIndex}
                    onClick={() => handleSelectPatient(patientOption.patientId)}
                    className={`cursor-pointer px-4 py-2 transition-colors ${
                      index === highlightedIndex
                        ? "bg-nutri-light-grey"
                        : "hover:bg-nutri-off-white"
                    }`}
                  >
                    <p className="text-sm font-medium text-nutri-black">{patientOption.name}</p>
                    <p className="text-xs text-nutri-dark-grey">CI: {patientOption.identityNumber}</p>
                    <p className="text-xs text-nutri-dark-grey">
                      Edad: {formatPediatricAge(patientOption.ageMonths)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex w-full flex-col sm:w-auto">
            <label className="mb-1 text-sm font-semibold text-nutri-dark-grey">
              Fecha de consulta
            </label>
            <input
              type="date"
              value={consultationDateFilter}
              onChange={(event) => handleConsultationDateChange(event.target.value)}
              className="nutri-input w-full sm:min-w-[220px]"
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-nutri-dark-grey/80">
          Selecciona un paciente y luego elige un resultado para mostrar el detalle.
          {consultationDateFilter
            ? ` Filtro activo por fecha: ${consultationDateFilter}.`
            : " Tambien puedes filtrar por fecha de consulta."}
        </p>

        {selectedPatient && (
          <div className="nutri-clinician-surface-soft mt-4 rounded-lg border border-nutri-light-grey px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-nutri-dark-grey">Diagnóstico del paciente:</p>
                <p className="text-base font-semibold text-nutri-primary">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </p>
                <p className="text-xs text-nutri-dark-grey">
                  CI: {selectedPatient.identityNumber} | Edad:{" "}
                  {selectedPatientAgeMonths !== null
                    ? formatPediatricAge(selectedPatientAgeMonths)
                    : "Sin dato"}
                </p>
                {!isSelectedPatientInTargetAge && (
                  <p className="text-xs font-medium text-nutri-secondary">
                    Paciente fuera del rango pediátrico objetivo (6 meses - 5 años).
                  </p>
                )}
              </div>

              <Button type="button" variant="outline" className="px-3 py-1.5 text-xs" onClick={handleClearSelection}>
                Quitar paciente
              </Button>
            </div>
          </div>
        )}

        {selectedPatient && (
          <div className="nutri-clinician-surface mt-4 space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-nutri-primary">
                {selectedConsultationResult ? "Consulta seleccionada" : "Resultados encontrados"}
              </p>
              <p className="text-xs text-nutri-dark-grey/80">
                {selectedConsultationResult
                  ? `Mostrando 1 de ${selectedPatientResults.length} registros`
                  : `${selectedPatientResults.length} registros`}
              </p>
            </div>

            {selectedPatientResults.length === 0 ? (
              <p className="rounded-lg border border-dashed border-nutri-light-grey bg-nutri-off-white px-4 py-3 text-sm text-nutri-dark-grey">
                No hay resultados para el paciente seleccionado
                {consultationDateFilter ? ` en la fecha ${consultationDateFilter}` : ""}.
              </p>
            ) : selectedConsultationResult ? (
              <div className="space-y-2">
                <div className="w-full rounded-lg border border-nutri-primary bg-nutri-off-white px-4 py-3">
                  <div className="grid grid-cols-1 gap-2 text-sm text-nutri-dark-grey md:grid-cols-2">
                    <p>
                      <span className="font-semibold">Paciente:</span>{" "}
                      {selectedConsultationResult.patientName}
                    </p>
                    <p>
                      <span className="font-semibold">Guardián:</span> {selectedGuardianName}
                    </p>
                    <p>
                      <span className="font-semibold">Atendido por:</span>{" "}
                      {selectedConsultationResult.attendedByName}
                    </p>
                    <p>
                      <span className="font-semibold">Fecha:</span>{" "}
                      {selectedConsultationResult.dateLabel}
                    </p>
                  </div>
                </div>

                {selectedPatientResults.length > 1 && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="px-3 py-1.5 text-xs"
                      onClick={handleChangeSelectedConsultation}
                    >
                      Cambiar consulta
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {selectedPatientResults.map((resultItem) => (
                  <button
                    key={resultItem.id}
                    type="button"
                    onClick={() => handleSelectResult(resultItem.id)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                      resultItem.id === selectedResultId
                        ? "border-nutri-primary bg-nutri-off-white"
                        : "border-nutri-light-grey bg-nutri-white hover:bg-nutri-off-white/70"
                    }`}
                  >
                    <div className="grid grid-cols-1 gap-2 text-sm text-nutri-dark-grey md:grid-cols-2">
                      <p>
                        <span className="font-semibold">Paciente:</span> {resultItem.patientName}
                      </p>
                      <p>
                        <span className="font-semibold">Guardián:</span> {selectedGuardianName}
                      </p>
                      <p>
                        <span className="font-semibold">Atendido por:</span> {resultItem.attendedByName}
                      </p>
                      <p>
                        <span className="font-semibold">Fecha:</span> {resultItem.dateLabel}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {selectedPatient && selectedPatientResults.length > 0 && !selectedConsultationResult && (
        <div className="nutri-clinician-surface p-5">
          <p className="text-sm text-nutri-dark-grey">
            Selecciona un resultado para mostrar el resumen y los tabs de resultados.
          </p>
        </div>
      )}

      {selectedConsultationResult && (
        <>
          <Tabs tabs={DIAGNOSIS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "summary" && (
        <>
          {!selectedPatient ? (
            <div className="nutri-clinician-surface p-5">
              <p className="text-sm text-nutri-dark-grey">
                Selecciona un paciente desde el buscador para ver su resumen diagnóstico.
              </p>
            </div>
          ) : !selectedConsultationResult ? (
            <div className="nutri-clinician-surface p-5">
              <p className="text-sm text-nutri-dark-grey">
                No hay consultas para el paciente seleccionado
                {consultationDateFilter ? ` en la fecha ${consultationDateFilter}` : ""}.
              </p>
            </div>
          ) : snapshotForSummary ? (
            <article className="nutri-clinician-surface space-y-5 p-4 sm:p-6">
              <header className="space-y-2 rounded-lg border border-nutri-primary/20 bg-nutri-white px-4 py-3">
                <p className="text-sm font-semibold text-nutri-primary">Resumen de la última consulta</p>
                <p className="text-xs text-nutri-dark-grey">
                  Fecha de registro: {formatDateTime(snapshotForSummary.savedAt)}
                </p>
              </header>

              <Section title="Paciente y responsable">
                <FieldRow
                  label="Paciente"
                  value={
                    selectedPatientUser
                      ? `${selectedPatientUser.firstName} ${selectedPatientUser.lastName}`
                      : `${selectedPatient?.firstName ?? ""} ${selectedPatient?.lastName ?? ""}`.trim() ||
                        "Sin dato"
                  }
                />
                <FieldRow
                  label="Cedula de identidad"
                  value={formatValue(selectedPatientUser?.identityNumber ?? selectedPatient?.identityNumber)}
                />
                <FieldRow
                  label="Guardián / responsable"
                  value={selectedGuardianName}
                />
                <FieldRow
                  label="Estado nutricional estimado"
                  value={deriveStatusFromMetrics(snapshotForSummary.anthropometric.bmi, snapshotForSummary.anthropometric.zScore)}
                />
                <FieldRow
                  label="Edad (consulta pediatrica)"
                  value={
                    selectedPatient
                      ? formatPediatricAge(calculateAgeInMonths(selectedPatient.birthDate, snapshotForSummary.savedAt))
                      : "Sin dato"
                  }
                />
              </Section>

              <Section title="1. Datos antropometricos">
                <FieldRow label="Peso (kg)" value={formatValue(snapshotForSummary.anthropometric.weightKg)} />
                <FieldRow label="Talla (m)" value={formatValue(snapshotForSummary.anthropometric.heightM)} />
                <FieldRow label="Perimetro braquial (cm)" value={formatValue(snapshotForSummary.anthropometric.muacCm)} />
                <FieldRow
                  label="Perimetro cefalico (cm)"
                  value={formatValue(snapshotForSummary.anthropometric.headCircumferenceCm)}
                />
                <FieldRow label="IMC" value={formatValue(snapshotForSummary.anthropometric.bmi)} />
                <FieldRow label="Puntaje Z" value={formatValue(snapshotForSummary.anthropometric.zScore)} />
                <FieldRow label="Percentil" value={formatValue(snapshotForSummary.anthropometric.percentile)} />
              </Section>

              <Section title="2. Datos clínicos">
                <FieldRow
                  label="Motivo principal de consulta"
                  value={formatValue(snapshotForSummary.clinical.mainConsultationReason)}
                />
                <FieldRow
                  label="Quien brinda la informacion"
                  value={formatValue(snapshotForSummary.clinical.informantType)}
                />
                <FieldRow
                  label="Nombre del informante"
                  value={formatValue(snapshotForSummary.clinical.informantName)}
                />
                <FieldRow
                  label="Parentesco del informante"
                  value={formatValue(snapshotForSummary.clinical.informantRelationship)}
                />
                <FieldRow
                  label="Senales de alarma actuales"
                  value={formatValue(snapshotForSummary.clinical.alarmSigns)}
                />
                <FieldRow
                  label="Peso al nacer (kg)"
                  value={formatValue(snapshotForSummary.clinical.birthWeightKg)}
                />
                <FieldRow
                  label="Edad gestacional al nacer (semanas)"
                  value={formatValue(snapshotForSummary.clinical.gestationalAgeWeeks)}
                />
                <FieldRow
                  label="Prematuridad"
                  value={formatValue(snapshotForSummary.clinical.prematurity)}
                />
                <FieldRow label="Nivel de actividad" value={formatValue(snapshotForSummary.clinical.activityLevel)} />
                <FieldRow label="Presencia de desanimo" value={formatValue(snapshotForSummary.clinical.apathy)} />
                <FieldRow
                  label="Observaciones generales"
                  value={formatValue(snapshotForSummary.clinical.generalObservations)}
                />
                <FieldRow label="Cabello" value={formatValue(snapshotForSummary.clinical.hairCondition)} />
                <FieldRow label="Piel" value={formatValue(snapshotForSummary.clinical.skinCondition)} />
                <FieldRow label="Edema" value={formatValue(snapshotForSummary.clinical.edema)} />
                <FieldRow
                  label="Edema bilateral (grado)"
                  value={formatValue(snapshotForSummary.clinical.bilateralEdemaGrade)}
                />
                <FieldRow label="Denticion" value={formatValue(snapshotForSummary.clinical.dentition)} />
                <FieldRow
                  label="Observaciones fisicas"
                  value={formatValue(snapshotForSummary.clinical.physicalObservations)}
                />
                <FieldRow label="Diarrea" value={formatValue(snapshotForSummary.clinical.diarrhea)} />
                <FieldRow label="Vomitos" value={formatValue(snapshotForSummary.clinical.vomiting)} />
                <FieldRow
                  label="Signos de deshidratacion"
                  value={formatValue(snapshotForSummary.clinical.dehydration)}
                />
                <FieldRow
                  label="Observaciones digestivas"
                  value={formatValue(snapshotForSummary.clinical.digestiveObservations)}
                />
                <FieldRow
                  label="Temperatura (C)"
                  value={formatValue(snapshotForSummary.clinical.temperatureCelsius)}
                />
                <FieldRow
                  label="Observacion de temperatura"
                  value={formatValue(snapshotForSummary.clinical.temperatureObservation)}
                />
                <FieldRow
                  label="Frecuencia cardiaca (lpm)"
                  value={formatValue(snapshotForSummary.clinical.heartRate)}
                />
                <FieldRow
                  label="Observacion de frecuencia cardiaca"
                  value={formatValue(snapshotForSummary.clinical.heartRateObservation)}
                />
                <FieldRow
                  label="Frecuencia respiratoria (rpm)"
                  value={formatValue(snapshotForSummary.clinical.respiratoryRate)}
                />
                <FieldRow
                  label="Observacion de frecuencia respiratoria"
                  value={formatValue(snapshotForSummary.clinical.respiratoryRateObservation)}
                />
                <FieldRow
                  label="Presion sistolica (mmHg)"
                  value={formatValue(snapshotForSummary.clinical.bloodPressureSystolic)}
                />
                <FieldRow
                  label="Presion diastolica (mmHg)"
                  value={formatValue(snapshotForSummary.clinical.bloodPressureDiastolic)}
                />
                <FieldRow
                  label="Presion arterial"
                  value={formatValue(snapshotForSummary.clinical.bloodPressure)}
                />
                <FieldRow
                  label="Observacion de presion arterial"
                  value={formatValue(snapshotForSummary.clinical.bloodPressureObservation)}
                />
              </Section>

              <Section title="3. Datos historicos">
                <FieldRow label="Lactancia materna" value={formatValue(snapshotForSummary.historical.breastfeeding)} />
                <FieldRow label="Uso de biberon" value={formatValue(snapshotForSummary.historical.bottleFeeding)} />
                <FieldRow
                  label="Frecuencia de biberon"
                  value={formatValue(snapshotForSummary.historical.feedingFrequency)}
                />
                <FieldRow
                  label="Inicio de alimentacion complementaria (meses)"
                  value={formatValue(snapshotForSummary.historical.complementaryFeedingStartMonths)}
                />
                <FieldRow
                  label="Frecuencia por grupo de alimentos"
                  value={
                    foodMatrixEntries.length
                      ? foodMatrixEntries
                          .map(([groupId, frequency]) => `${FOOD_GROUP_LABELS[groupId]}: ${frequency}`)
                          .join(" | ")
                      : "Sin dato"
                  }
                />
                <FieldRow label="Comidas por dia" value={formatValue(snapshotForSummary.historical.mealsPerDay)} />
                <FieldRow
                  label="Horarios habituales"
                  value={
                    mealScheduleEntries.length
                      ? mealScheduleEntries
                          .map(([slotId, hour]) => `${MEAL_SLOT_LABELS[slotId]} ${hour}`)
                          .join(" | ")
                      : "Sin dato"
                  }
                />
                <FieldRow
                  label="Recordatorio 24h (desayuno/almuerzo/cena/snacks)"
                  value={
                    recall24hEntries.length
                      ? recall24hEntries
                          .map(([slotId, value]) => `${RECALL_SLOT_LABELS[slotId]}: ${value}`)
                          .join(" | ")
                      : "Sin dato"
                  }
                />
                <FieldRow
                  label="Azucar/sal añadida"
                  value={formatValue(snapshotForSummary.historical.addedSugarSalt)}
                />
                <FieldRow
                  label="Frecuencia de azucar/sal añadida"
                  value={formatValue(snapshotForSummary.historical.addedSugarSaltFrequency)}
                />
                <FieldRow
                  label="Apetito"
                  value={formatValue(snapshotForSummary.historical.appetiteLevel)}
                />
                <FieldRow
                  label="Vasos de agua por dia"
                  value={formatValue(snapshotForSummary.historical.waterGlassesPerDay)}
                />
                <FieldRow
                  label="Alergias/intolerancias alimentarias"
                  value={formatValue(snapshotForSummary.historical.foodAllergiesOrIntolerances)}
                />
                <FieldRow
                  label="Suplementacion actual"
                  value={formatValue(snapshotForSummary.historical.currentSupplementation)}
                />
                <FieldRow
                  label="Suplementacion (otros)"
                  value={formatValue(snapshotForSummary.historical.currentSupplementationOther)}
                />
                <FieldRow
                  label="Desparasitación (última fecha)"
                  value={formatValue(snapshotForSummary.historical.dewormingLastDate)}
                />
                <FieldRow
                  label="Medicamentos actuales"
                  value={formatValue(snapshotForSummary.historical.currentMedications)}
                />
                <FieldRow
                  label="Enfermedades recientes"
                  value={formatValue(snapshotForSummary.historical.recentIllnesses)}
                />
                <FieldRow
                  label="Otros antecedentes recientes"
                  value={formatValue(snapshotForSummary.historical.recentIllnessesOther)}
                />
                <FieldRow
                  label="Estado de vacunacion"
                  value={formatValue(snapshotForSummary.historical.vaccinationStatus)}
                />
                <FieldRow
                  label="Acceso a agua segura"
                  value={formatValue(snapshotForSummary.historical.safeWaterAccess)}
                />
                <FieldRow
                  label="Saneamiento basico"
                  value={formatValue(snapshotForSummary.historical.basicSanitation)}
                />
                <FieldRow
                  label="Inseguridad alimentaria: faltaron alimentos en casa"
                  value={formatValue(snapshotForSummary.historical.foodInsecurityConcern)}
                />
                <FieldRow
                  label="Inseguridad alimentaria: reduccion/omision de comidas"
                  value={formatValue(snapshotForSummary.historical.foodInsecurityMealSkip)}
                />
                <FieldRow
                  label="Cuidador principal"
                  value={formatValue(snapshotForSummary.historical.primaryCaregiver)}
                />
                <FieldRow
                  label="Asistencia a guarderia"
                  value={formatValue(snapshotForSummary.historical.daycareAttendance)}
                />
                <FieldRow
                  label="Horas promedio de sueno"
                  value={formatValue(snapshotForSummary.historical.sleepAverageHours)}
                />
                <FieldRow
                  label="Calidad de sueno"
                  value={formatValue(snapshotForSummary.historical.sleepQuality)}
                />
                <FieldRow label="Hora de acostarse" value={formatValue(snapshotForSummary.historical.bedtime)} />
                <FieldRow
                  label="Hora de levantarse"
                  value={formatValue(snapshotForSummary.historical.wakeupTime)}
                />
              </Section>

            </article>
          ) : (
            <article className="nutri-clinician-surface space-y-5 p-4 sm:p-6">
              <header className="space-y-2 rounded-lg border border-nutri-primary/20 bg-nutri-white px-4 py-3">
                <p className="text-sm font-semibold text-nutri-primary">Resumen de la última consulta</p>
                <p className="text-xs text-nutri-dark-grey">
                  Fecha de consulta: {selectedConsultationResult?.dateLabel ?? "Sin dato"}
                </p>
              </header>

              <Section title="Paciente y responsable">
                <FieldRow
                  label="Paciente"
                  value={
                    selectedPatientUser
                      ? `${selectedPatientUser.firstName} ${selectedPatientUser.lastName}`
                      : `${selectedPatient.firstName} ${selectedPatient.lastName}`
                  }
                />
                <FieldRow
                  label="Cedula de identidad"
                  value={formatValue(selectedPatientUser?.identityNumber ?? selectedPatient.identityNumber)}
                />
                <FieldRow
                  label="Guardián / responsable"
                  value={selectedGuardianName}
                />
                <FieldRow
                  label="Edad al momento de la consulta"
                  value={formatPediatricAge(selectedConsultationResult.ageMonths)}
                />
              </Section>

              <Section title="Diagnóstico final">
                <FieldRow
                  label="Estado nutricional"
                  value={selectedConsultationResult.nutritionalStatus}
                />
                <FieldRow
                  label="Detalle diagnóstico"
                  value={selectedConsultationDetail}
                />
                <FieldRow
                  label="IMC"
                  value={formatValue(selectedConsultationResult.bmi)}
                />
                <FieldRow
                  label="Puntaje Z / Percentil"
                  value={formatValue(selectedConsultationResult.zScore)}
                />
              </Section>
            </article>
          )}
        </>
      )}

      {activeTab === "results" && (
        <>
          <section className="space-y-4 rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm sm:p-5">
            <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-base font-semibold text-nutri-primary">Resultados de diagnóstico</h3>
              <p className="text-xs text-nutri-dark-grey/80">
                Registros encontrados: {selectedPatientResults.length}
              </p>
            </header>

          <header className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-4 py-3">
            <p className="text-sm font-semibold text-nutri-dark-grey">
              {RESULTS_STEPS[resultsStep].title}
            </p>
          </header>

          {resultsStep === 0 && (
            <article className="nutri-clinician-surface-soft space-y-4 p-4">
              {!selectedPatient ? (
                <p className="text-sm text-nutri-dark-grey">
                  Selecciona un paciente para mostrar su diagnóstico final.
                </p>
              ) : !selectedConsultationResult ? (
                <p className="text-sm text-nutri-dark-grey">
                  No hay resultados para el paciente seleccionado
                  {consultationDateFilter ? ` en la fecha ${consultationDateFilter}` : ""}.
                </p>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                      Diagnóstico final
                    </p>
                    <p className="text-lg font-semibold text-nutri-primary">
                      {selectedConsultationResult.nutritionalStatus}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                      Diagnóstico detallado
                    </p>
                    <p className="text-sm leading-relaxed text-nutri-dark-grey">
                      {selectedConsultationDetail}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm text-nutri-dark-grey sm:grid-cols-2">
                    <p>
                      <span className="font-semibold">Paciente:</span>{" "}
                      {selectedConsultationResult.patientName}
                    </p>
                    <p>
                      <span className="font-semibold">Fecha:</span> {selectedConsultationResult.dateLabel}
                    </p>
                  </div>
                </>
              )}
            </article>
          )}

          {resultsStep === 1 && (
            <article className="nutri-clinician-surface-soft space-y-5 p-4">
              {!selectedPatient ? (
                <p className="text-sm text-nutri-dark-grey">
                  Selecciona un paciente para ver recomendaciones.
                </p>
              ) : !selectedConsultationResult ? (
                <p className="text-sm text-nutri-dark-grey">
                  No hay diagnósticos para generar recomendaciones
                  {consultationDateFilter ? ` en la fecha ${consultationDateFilter}` : ""}.
                </p>
              ) : !recommendationData ? (
                <p className="text-sm text-nutri-dark-grey">
                  No fue posible construir recomendaciones para el paciente seleccionado.
                </p>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                      Recomendaciones médicas generales
                    </p>
                    <p className="text-sm leading-relaxed text-nutri-dark-grey">
                      {recommendationData.medicalText}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                      Recomendaciones alimentarias
                    </p>
                    <p className="text-sm leading-relaxed text-nutri-dark-grey">
                      {recommendationData.dietaryText}
                    </p>
                  </div>

                  {automatedFollowUpRecommendations.length > 0 && (
                    <p className="text-sm leading-relaxed text-nutri-dark-grey">
                      Seguimiento automatizado: {automatedFollowUpRecommendations.join(" ")}
                    </p>
                  )}

                  {!recommendationData.hasPersistedRecommendation && (
                    <p className="text-xs text-nutri-dark-grey/80">
                      Se muestra una propuesta base porque no hay una recomendación guardada para
                      este diagnóstico.
                    </p>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                      Alimentos sugeridos y composicion nutricional
                    </p>

                    <div className="overflow-x-auto rounded-lg border border-nutri-light-grey bg-nutri-white">
                      <table className="min-w-[980px] table-auto text-sm">
                        <thead className="bg-nutri-off-white">
                          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/80">
                            <th className="px-3 py-2">Alimento</th>
                            <th className="px-3 py-2">Categoria</th>
                            <th className="px-3 py-2">Porcion recomendada</th>
                            <th className="px-3 py-2">Frecuencia (veces/dia)</th>
                            <th className="px-3 py-2">Edad ref.</th>
                            <th className="px-3 py-2">Energia (kcal)</th>
                            <th className="px-3 py-2">Proteina (g)</th>
                            <th className="px-3 py-2">Grasa (g)</th>
                            <th className="px-3 py-2">Carbohidratos (g)</th>
                            <th className="px-3 py-2">Fibra (g)</th>
                            <th className="px-3 py-2">Vitaminas</th>
                            <th className="px-3 py-2">Minerales</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recommendationData.foodRows.map((foodRow) => (
                            <tr key={foodRow.foodId} className="border-t border-nutri-light-grey">
                              <td className="px-3 py-2 font-medium text-nutri-dark-grey">
                                {foodRow.foodName}
                              </td>
                              <td className="px-3 py-2 text-nutri-dark-grey">{foodRow.category}</td>
                              <td className="px-3 py-2 text-nutri-dark-grey">{foodRow.portion}</td>
                              <td className="px-3 py-2 text-nutri-dark-grey">{foodRow.timesPerDay}</td>
                              <td className="px-3 py-2 text-nutri-dark-grey">{foodRow.referenceAge}</td>
                              <td className="px-3 py-2 text-nutri-dark-grey">{foodRow.energyKcal}</td>
                              <td className="px-3 py-2 text-nutri-dark-grey">{foodRow.proteinG}</td>
                              <td className="px-3 py-2 text-nutri-dark-grey">{foodRow.fatG}</td>
                              <td className="px-3 py-2 text-nutri-dark-grey">{foodRow.carbohydratesG}</td>
                              <td className="px-3 py-2 text-nutri-dark-grey">{foodRow.fiberG}</td>
                              <td className="px-3 py-2 text-nutri-dark-grey">{foodRow.vitamins}</td>
                              <td className="px-3 py-2 text-nutri-dark-grey">{foodRow.minerals}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <DiagnosisRestrictedFoodsSection
                    groups={recommendationData.restrictedFoodGroups}
                  />
                </>
              )}
            </article>
          )}

          {resultsStep === 2 && (
            <article className="nutri-clinician-surface-soft space-y-4 p-4">
              {!selectedPatient ? (
                <p className="text-sm text-nutri-dark-grey">
                  Selecciona un paciente para visualizar sus graficos de progreso.
                </p>
              ) : growthIndicators.length === 0 ? (
                <p className="text-sm text-nutri-dark-grey">
                  No hay datos antropometricos suficientes para construir graficos
                  {consultationDateFilter ? ` en la fecha ${consultationDateFilter}` : ""}.
                </p>
              ) : (
                <>
                  <header className="space-y-2 rounded-lg border border-nutri-primary/20 bg-nutri-white px-4 py-3">
                    <p className="text-sm font-semibold text-nutri-primary">
                      Indicadores antropometricos
                    </p>
                    <p className="text-xs text-nutri-dark-grey/80">
                      Peso para la edad, talla para la edad y peso para la talla con curvas
                      percentilares P3, P15, P50, P85 y P97.
                    </p>
                  </header>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    {growthIndicators.map((indicator) => (
                      <section
                        key={indicator.id}
                        className="space-y-2 rounded-lg border border-nutri-light-grey bg-nutri-white p-3"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                          {indicator.shortTitle}
                        </p>
                        <p className="text-xl font-semibold text-nutri-primary">
                          {indicator.latestPoint.actual.toFixed(2)} {indicator.unit}
                        </p>
                        <p className="text-xs text-nutri-dark-grey/80">
                          Percentil {indicator.latestPoint.percentile.toFixed(1)} | Puntaje Z{" "}
                          {indicator.latestPoint.zScore.toFixed(2)}
                        </p>
                        <p
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${getToneClasses(indicator.tone)}`}
                        >
                          {indicator.statusLabel}
                        </p>
                        <p className="text-xs leading-relaxed text-nutri-dark-grey">
                          {indicator.description}
                        </p>
                        {indicator.points.length > 1 && (
                          <p className="text-xs text-nutri-dark-grey/80">
                            Variación reciente: {formatSigned(indicator.percentileDelta)} percentiles |
                            Z {formatSigned(indicator.zDelta, 2)}
                          </p>
                        )}
                      </section>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {growthIndicators.map((indicator) => (
                      <AnthropometricTrendChart
                        key={indicator.id}
                        title={indicator.title}
                        unit={indicator.unit}
                        points={indicator.points}
                        interpretation={indicator.interpretation}
                        className="cursor-zoom-in transition-transform hover:-translate-y-0.5"
                        onClick={() => handleOpenExpandedChart(indicator.id)}
                      />
                    ))}
                  </div>

                  <section className="space-y-2 rounded-lg border border-nutri-light-grey bg-nutri-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                      Tabla de seguimiento percentilar
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-nutri-light-grey bg-nutri-white">
                      <table className="min-w-[780px] table-auto text-sm">
                        <thead className="bg-nutri-off-white">
                          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/80">
                            <th className="px-3 py-2">Indicador</th>
                            <th className="px-3 py-2">Valor actual</th>
                            <th className="px-3 py-2">Percentil</th>
                            <th className="px-3 py-2">Puntaje Z</th>
                            <th className="px-3 py-2">Estado</th>
                            <th className="px-3 py-2">Tendencia reciente</th>
                          </tr>
                        </thead>
                        <tbody>
                          {growthIndicators.map((indicator) => (
                            <tr key={`summary-${indicator.id}`} className="border-t border-nutri-light-grey">
                              <td className="px-3 py-2 font-medium text-nutri-dark-grey">
                                {indicator.title}
                              </td>
                              <td className="px-3 py-2 text-nutri-dark-grey">
                                {indicator.latestPoint.actual.toFixed(2)} {indicator.unit}
                              </td>
                              <td className="px-3 py-2 text-nutri-dark-grey">
                                {indicator.latestPoint.percentile.toFixed(1)}
                              </td>
                              <td className="px-3 py-2 text-nutri-dark-grey">
                                {indicator.latestPoint.zScore.toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-nutri-dark-grey">{indicator.statusLabel}</td>
                              <td className="px-3 py-2 text-nutri-dark-grey">
                                {indicator.points.length > 1
                                  ? `${formatSigned(indicator.percentileDelta)} pct | Z ${formatSigned(indicator.zDelta, 2)}`
                                  : "Primera medicion"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}
            </article>
          )}

          <div className="flex items-center justify-between gap-3">
            <div>
              {resultsStep > 0 && (
                <Button variant="outline" onClick={() => setResultsStep(resultsStep - 1)}>
                  Punto anterior
                </Button>
              )}
            </div>
            <div>
              {resultsStep < RESULTS_STEPS.length - 1 && (
                <Button variant="outline" onClick={() => setResultsStep(resultsStep + 1)}>
                  Punto siguiente
                </Button>
              )}
            </div>
          </div>

            <StepDots
              steps={RESULTS_STEPS}
              currentStep={resultsStep}
              maxUnlockedStep={RESULTS_STEPS.length - 1}
              onStepChange={setResultsStep}
            />
          </section>
        </>
      )}

          <div className="mt-4 flex w-full justify-end">
            <Button
              type="button"
              variant="primary"
              className="px-7 py-3.5 text-sm font-bold shadow-[0_10px_24px_rgba(23,42,58,0.25)] sm:text-base"
              onClick={handleGeneratePdfReport}
              disabled={!selectedConsultationResult || isGeneratingReport}
            >
              {isGeneratingReport ? "Generando informe..." : "Generar Reporte PDF"}
            </Button>
          </div>
        </>
      )}

      {expandedGrowthIndicator && (
        <div className="fixed inset-0 z-[120] bg-black/85 p-4 sm:p-8">
          <div className="mx-auto flex h-full max-w-[1400px] flex-col">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">
                Vista ampliada: {expandedGrowthIndicator.title}
              </p>
              <Button
                type="button"
                variant="outline"
                className="border-white/30 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                onClick={handleCloseExpandedChart}
              >
                Cerrar
              </Button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center">
              <AnthropometricTrendChart
                title={expandedGrowthIndicator.title}
                unit={expandedGrowthIndicator.unit}
                points={expandedGrowthIndicator.points}
                interpretation={expandedGrowthIndicator.interpretation}
                className="w-full max-w-[1280px] bg-white shadow-2xl"
                svgClassName="h-[72vh] w-full"
                onDoubleClick={handleCloseExpandedChart}
              />
            </div>

            <p className="mt-3 text-center text-xs text-white/80">
              Doble clic sobre el grafico ampliado para cerrar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisDocumentContent;
