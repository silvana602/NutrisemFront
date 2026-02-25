import type {
  AnthropometricData,
  Consultation,
  Diagnosis,
  Food,
  Recommendation,
  RecommendationFood,
} from "@/types";

import type {
  ConsultationSnapshot,
  ProgressCopy,
  ProgressDirection,
  ZoneCopy,
  ZoneLevel,
} from "../types";

const dateFormatter = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
});

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toSafeNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function formatDate(value: Date): string {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return "Sin fecha";
  return dateFormatter.format(value);
}

function calculateBmi(weightKg: number | null, heightM: number | null): number | null {
  if (weightKg === null || heightM === null || heightM <= 0) return null;
  return Number((weightKg / (heightM * heightM)).toFixed(2));
}

function getDelta(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null) return null;
  return Number((current - previous).toFixed(2));
}

function truncateMissionText(value: string): string {
  const firstSentence = value.split(".").find((item) => item.trim().length > 0)?.trim() ?? value.trim();

  if (firstSentence.length <= 95) return firstSentence;
  return `${firstSentence.slice(0, 92).trimEnd()}...`;
}

function zoneToScore(zone: ZoneLevel): number {
  if (zone === "green") return 2;
  if (zone === "yellow") return 1;
  return 0;
}

export function formatMetric(value: number | null, unit: string, decimals = 2): string {
  if (value === null) return "Sin dato";
  return `${value.toFixed(decimals)} ${unit}`.trimEnd();
}

export function formatDelta(
  current: number | null,
  previous: number | null,
  unit: string,
  decimals = 2
): string {
  const delta = getDelta(current, previous);
  if (delta === null) return "Sin datos comparables";
  if (Math.abs(delta) < 0.01) return `0 ${unit}`.trimEnd();
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(decimals)} ${unit}`.trimEnd();
}

export function inferZoneFromStatus(status: string | null): ZoneLevel {
  if (!status) return "yellow";

  const normalized = normalizeText(status);

  if (normalized.includes("normal") || normalized.includes("eutro")) {
    return "green";
  }

  if (normalized.includes("riesgo") || normalized.includes("sobrepeso")) {
    return "yellow";
  }

  if (
    normalized.includes("desnutricion") ||
    normalized.includes("obesidad") ||
    normalized.includes("bajo peso")
  ) {
    return "red";
  }

  return "yellow";
}

export function getZoneCopy(zone: ZoneLevel): ZoneCopy {
  if (zone === "green") {
    return {
      label: "Zona verde",
      message: "Vas por buen camino!",
    };
  }

  if (zone === "yellow") {
    return {
      label: "Zona amarilla",
      message: "Tu meta esta cerca",
    };
  }

  return {
    label: "Zona roja",
    message: "Atencion necesaria",
  };
}

export function compareZoneProgress(
  current: ZoneLevel,
  previous: ZoneLevel | null
): ProgressDirection {
  if (!previous) return "no-data";

  const currentScore = zoneToScore(current);
  const previousScore = zoneToScore(previous);

  if (currentScore > previousScore) return "improved";
  if (currentScore < previousScore) return "declined";
  return "stable";
}

export function getProgressCopy(direction: ProgressDirection): ProgressCopy {
  if (direction === "improved") {
    return {
      title: "Mostraste progreso frente a tu consulta anterior.",
      subtitle: "Tu estado actual esta mejor que el control previo.",
      badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
      badgeLabel: "Progreso",
    };
  }

  if (direction === "declined") {
    return {
      title: "Hubo retroceso frente al control anterior.",
      subtitle: "No pasa nada, puedes retomar tu plan desde hoy.",
      badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
      badgeLabel: "Retroceso",
    };
  }

  if (direction === "stable") {
    return {
      title: "Te mantienes en el mismo nivel del control anterior.",
      subtitle: "Con constancia puedes avanzar al siguiente objetivo.",
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
      badgeLabel: "Sin cambios",
    };
  }

  return {
    title: "Aun no hay una consulta previa para comparar.",
    subtitle: "Cuando tengas un nuevo control, veras tu tendencia aquí.",
    badgeClassName: "border-nutri-light-grey bg-nutri-off-white text-nutri-dark-grey",
    badgeLabel: "Pendiente",
  };
}

export function pickDailyMission(recommendation: Recommendation | null): string {
  if (recommendation?.dietaryRecommendation) {
    return `Recuerda hoy: ${truncateMissionText(recommendation.dietaryRecommendation)}`;
  }

  if (recommendation?.medicalRecommendation) {
    return `Hoy toca: ${truncateMissionText(recommendation.medicalRecommendation)}`;
  }

  return "Hoy toca 20 min de juego activo y beber agua durante el dia.";
}

export function getFirstSuggestedFoodName(
  recommendationId: string | null,
  recommendationFoods: RecommendationFood[],
  foods: Food[]
): string | null {
  if (!recommendationId) return null;

  const foodReference =
    recommendationFoods.find((item) => item.recommendationId === recommendationId) ?? null;
  if (!foodReference) return null;

  const food = foods.find((item) => item.foodId === foodReference.foodId) ?? null;
  return food?.foodName ?? null;
}

export function buildEducationQuestion(foodName: string | null): string {
  if (foodName) {
    return `Sabias por que es importante comer ${foodName.toLowerCase()}? Descubrelo aquí.`;
  }

  return "Sabias por que es importante comer espinaca? Descubrelo aquí.";
}

const EDUCATION_QUICK_ACCESS_ARTICLE = {
  title: "El plato arcoiris: Por que variar los colores?",
  suggestedQuery: "plato arcoiris",
  suggestedTagId: "recetas" as const,
  targetSectionId: "biblioteca-educativa" as const,
  targetArticleId: "education-article-rainbow-plate" as const,
};

type EducationQuickAccess = {
  question: string;
  suggestedQuery: typeof EDUCATION_QUICK_ACCESS_ARTICLE.suggestedQuery;
  suggestedTagId: typeof EDUCATION_QUICK_ACCESS_ARTICLE.suggestedTagId;
  targetSectionId: typeof EDUCATION_QUICK_ACCESS_ARTICLE.targetSectionId;
  targetArticleId: typeof EDUCATION_QUICK_ACCESS_ARTICLE.targetArticleId;
};

export function buildEducationQuickAccess(foodName: string | null): EducationQuickAccess {
  const normalizedFoodName = foodName?.trim().toLowerCase() ?? null;

  if (normalizedFoodName) {
    return {
      question: `${EDUCATION_QUICK_ACCESS_ARTICLE.title} Aprende como incluir ${normalizedFoodName} en sus comidas.`,
      suggestedQuery: EDUCATION_QUICK_ACCESS_ARTICLE.suggestedQuery,
      suggestedTagId: EDUCATION_QUICK_ACCESS_ARTICLE.suggestedTagId,
      targetSectionId: EDUCATION_QUICK_ACCESS_ARTICLE.targetSectionId,
      targetArticleId: EDUCATION_QUICK_ACCESS_ARTICLE.targetArticleId,
    };
  }

  return {
    question: `${EDUCATION_QUICK_ACCESS_ARTICLE.title} Descubrelo aquí.`,
    suggestedQuery: EDUCATION_QUICK_ACCESS_ARTICLE.suggestedQuery,
    suggestedTagId: EDUCATION_QUICK_ACCESS_ARTICLE.suggestedTagId,
    targetSectionId: EDUCATION_QUICK_ACCESS_ARTICLE.targetSectionId,
    targetArticleId: EDUCATION_QUICK_ACCESS_ARTICLE.targetArticleId,
  };
}

export function buildConsultationSnapshots(
  patientId: string,
  consultations: Consultation[],
  diagnoses: Diagnosis[],
  anthropometricData: AnthropometricData[],
  recommendations: Recommendation[]
): ConsultationSnapshot[] {
  const diagnosisByConsultationId = new Map(
    diagnoses.map((item) => [item.consultationId, item] as const)
  );
  const anthropometricByConsultationId = new Map(
    anthropometricData.map((item) => [item.consultationId, item] as const)
  );
  const recommendationByDiagnosisId = new Map(
    recommendations.map((item) => [item.diagnosisId, item] as const)
  );

  return consultations
    .filter((item) => item.patientId === patientId)
    .sort((first, second) => second.date.getTime() - first.date.getTime())
    .map((consultation) => {
      const diagnosis = diagnosisByConsultationId.get(consultation.consultationId) ?? null;
      const anthropometric = anthropometricByConsultationId.get(consultation.consultationId) ?? null;
      const recommendation = diagnosis
        ? recommendationByDiagnosisId.get(diagnosis.diagnosisId) ?? null
        : null;

      const weightKg = toSafeNumber(anthropometric?.weightKg);
      const heightM = toSafeNumber(anthropometric?.heightM);
      const calculatedBmi = calculateBmi(weightKg, heightM);

      return {
        dateLabel: formatDate(consultation.date),
        weightKg,
        heightM,
        muacCm: toSafeNumber(anthropometric?.muacCm),
        headCircumferenceCm: toSafeNumber(anthropometric?.headCircumferenceCm),
        bmi: toSafeNumber(diagnosis?.bmi) ?? calculatedBmi,
        nutritionalStatus: diagnosis?.nutritionalDiagnosis ?? null,
        recommendation,
      };
    });
}

export function getZoneArrowPosition(zone: ZoneLevel): string {
  if (zone === "green") return "14%";
  if (zone === "yellow") return "50%";
  return "86%";
}
