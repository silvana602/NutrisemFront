import { calculateAgeInMonths, formatPediatricAge } from "@/lib/pediatricAge";
import type { AnthropometricData, Consultation, Patient } from "@/types";
import type {
  AnthropometricPercentileProfile,
  AnthropometricTrendPoint,
  AnthropometricZone,
} from "@/components/organisms/clinician/diagnosis/AnthropometricTrendChart";

import type {
  PatientProgressGrowthIndicator,
  PatientProgressIndicatorId,
  PatientProgressRawRow,
} from "../types";
import { formatDate, formatDateKey } from "./patientProgressFormatting.utils";

type MetricNormalRange = {
  min: number;
  max: number;
};

type AgeNormalBucket = {
  fromMonths: number;
  toMonths: number;
  weightKg: MetricNormalRange;
  heightCm: MetricNormalRange;
};

type IndicatorDefinition = {
  id: PatientProgressIndicatorId;
  title: string;
  unit: string;
  getActualValue: (row: PatientProgressRawRow) => number;
  getRangeByAge: (ageMonths: number) => MetricNormalRange;
};

const AGE_NORMAL_BUCKETS: readonly AgeNormalBucket[] = [
  {
    fromMonths: 6,
    toMonths: 11,
    weightKg: { min: 6.5, max: 11.0 },
    heightCm: { min: 65, max: 78 },
  },
  {
    fromMonths: 12,
    toMonths: 23,
    weightKg: { min: 8.0, max: 13.5 },
    heightCm: { min: 73, max: 90 },
  },
  {
    fromMonths: 24,
    toMonths: 35,
    weightKg: { min: 10.0, max: 16.0 },
    heightCm: { min: 83, max: 98 },
  },
  {
    fromMonths: 36,
    toMonths: 47,
    weightKg: { min: 12.0, max: 19.0 },
    heightCm: { min: 92, max: 106 },
  },
  {
    fromMonths: 48,
    toMonths: 60,
    weightKg: { min: 14.0, max: 22.0 },
    heightCm: { min: 100, max: 115 },
  },
];

const DEFAULT_WEIGHT_RANGE: MetricNormalRange = { min: 6.5, max: 22.0 };
const DEFAULT_HEIGHT_RANGE: MetricNormalRange = { min: 65, max: 115 };

const WHO_PERCENTILE_ANCHORS = [
  { key: "p3", percentile: 3, zScore: -2 },
  { key: "p15", percentile: 15, zScore: -1 },
  { key: "p50", percentile: 50, zScore: 0 },
  { key: "p85", percentile: 85, zScore: 1 },
  { key: "p97", percentile: 97, zScore: 2 },
] as const;

const INDICATOR_DEFINITIONS: readonly IndicatorDefinition[] = [
  {
    id: "weightForAge",
    title: "Curva OMS de peso para la edad",
    unit: "kg",
    getActualValue: (row) => row.weightKg,
    getRangeByAge: (ageMonths) => {
      const bucket = AGE_NORMAL_BUCKETS.find(
        (item) => ageMonths >= item.fromMonths && ageMonths <= item.toMonths
      );
      return bucket?.weightKg ?? DEFAULT_WEIGHT_RANGE;
    },
  },
  {
    id: "heightForAge",
    title: "Curva OMS de talla para la edad",
    unit: "cm",
    getActualValue: (row) => row.heightCm,
    getRangeByAge: (ageMonths) => {
      const bucket = AGE_NORMAL_BUCKETS.find(
        (item) => ageMonths >= item.fromMonths && ageMonths <= item.toMonths
      );
      return bucket?.heightCm ?? DEFAULT_HEIGHT_RANGE;
    },
  },
];

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

function estimatePercentileFromProfile(value: number, profile: AnthropometricPercentileProfile): number {
  const anchors = WHO_PERCENTILE_ANCHORS.map((anchor) => ({
    value: profile[anchor.key],
    mapped: anchor.percentile,
  }));

  return Number(clampNumber(estimateFromPercentileAnchors(value, anchors), 0, 100).toFixed(1));
}

function estimateZScoreFromProfile(value: number, profile: AnthropometricPercentileProfile): number {
  const anchors = WHO_PERCENTILE_ANCHORS.map((anchor) => ({
    value: profile[anchor.key],
    mapped: anchor.zScore,
  }));

  return Number(estimateFromPercentileAnchors(value, anchors).toFixed(2));
}

function getZoneFromPercentile(percentile: number): AnthropometricZone {
  if (percentile < 3 || percentile > 97) return "red";
  if (percentile < 15 || percentile > 85) return "yellow";
  return "green";
}

function formatSigned(value: number, decimals = 1): string {
  const fixed = value.toFixed(decimals);
  return value > 0 ? `+${fixed}` : fixed;
}

function buildLatestMessage(points: AnthropometricTrendPoint[]): string {
  const latestPoint = points[points.length - 1];
  const previousPoint = points.length > 1 ? points[points.length - 2] : null;

  if (!previousPoint) {
    return `Valor actual ${latestPoint.actual.toFixed(2)}, percentil ${latestPoint.percentile.toFixed(
      1
    )}. Sigue con tus controles periodicos.`;
  }

  const percentileDelta = latestPoint.percentile - previousPoint.percentile;
  const trendCopy =
    percentileDelta <= -10
      ? "descenso importante de la curva."
      : percentileDelta <= -4
        ? "descenso leve de la curva."
        : percentileDelta >= 8
          ? "avance favorable de la curva."
          : "trayectoria estable.";

  return `Percentil actual ${latestPoint.percentile.toFixed(
    1
  )} con variación ${formatSigned(percentileDelta)} (${trendCopy})`;
}

function buildHighlightLabel(point: AnthropometricTrendPoint | null): string | null {
  if (!point) return null;
  if (point.percentile >= 40 && point.percentile <= 60) {
    return "Estas creciendo justo como se esperaba!";
  }
  return null;
}

export function buildPatientProgressRows(params: {
  patient: Patient;
  consultations: Consultation[];
  anthropometricData: AnthropometricData[];
}): PatientProgressRawRow[] {
  const { patient, consultations, anthropometricData } = params;

  const anthropometricByConsultationId = new Map(
    anthropometricData.map((item) => [item.consultationId, item] as const)
  );

  return consultations
    .filter((consultation) => consultation.patientId === patient.patientId)
    .map((consultation) => {
      const anthropometric = anthropometricByConsultationId.get(consultation.consultationId) ?? null;
      if (!anthropometric) return null;
      if (!Number.isFinite(anthropometric.weightKg) || !Number.isFinite(anthropometric.heightM)) return null;
      if (anthropometric.heightM <= 0) return null;

      return {
        consultationId: consultation.consultationId,
        dateValue: consultation.date.getTime(),
        dateKey: formatDateKey(consultation.date),
        dateLabel: formatDate(consultation.date),
        ageMonths: calculateAgeInMonths(patient.birthDate, consultation.date),
        weightKg: anthropometric.weightKg,
        heightCm: Number((anthropometric.heightM * 100).toFixed(1)),
      } satisfies PatientProgressRawRow;
    })
    .filter((row): row is PatientProgressRawRow => row !== null)
    .sort((first, second) => first.dateValue - second.dateValue);
}

export function buildProgressGrowthIndicators(
  rows: PatientProgressRawRow[]
): PatientProgressGrowthIndicator[] {
  const pediatricRows = rows.filter((row) => row.ageMonths >= 6 && row.ageMonths <= 60);

  return INDICATOR_DEFINITIONS.map((definition) => {
    const points = pediatricRows
      .map((row) => {
        const actual = definition.getActualValue(row);
        if (!Number.isFinite(actual)) return null;

        const range = definition.getRangeByAge(row.ageMonths);
        const profile = buildPercentileProfileFromRange(range);
        const percentile = estimatePercentileFromProfile(actual, profile);
        const zScore = estimateZScoreFromProfile(actual, profile);

        return {
          dateLabel: row.dateLabel,
          ageLabel: formatPediatricAge(row.ageMonths),
          actual,
          percentiles: profile,
          zone: getZoneFromPercentile(percentile),
          percentile,
          zScore,
        } satisfies AnthropometricTrendPoint;
      })
      .filter((point): point is AnthropometricTrendPoint => point !== null);

    const latestPoint = points.length ? points[points.length - 1] : null;

    return {
      id: definition.id,
      title: definition.title,
      unit: definition.unit,
      points,
      latestMessage: points.length
        ? buildLatestMessage(points)
        : "No hay datos suficientes para construir la curva de crecimiento.",
      isNearMedian: Boolean(
        latestPoint && latestPoint.percentile >= 40 && latestPoint.percentile <= 60
      ),
      highlightLabel: buildHighlightLabel(latestPoint),
    } satisfies PatientProgressGrowthIndicator;
  });
}
