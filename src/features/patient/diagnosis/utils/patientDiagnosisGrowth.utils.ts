import type { AnthropometricData, Consultation } from "@/types";
import { calculateAgeInMonths, formatPediatricAge } from "@/lib/pediatricAge";
import type {
  AnthropometricPercentileProfile,
  AnthropometricTrendPoint,
  AnthropometricZone,
} from "@/components/organisms/clinician/diagnosis/AnthropometricTrendChart";

import { escapeHtml, formatDate } from "./patientDiagnosisFormatting.utils";

type MetricNormalRange = { min: number; max: number };

type WeightForHeightBucket = {
  fromHeightCm: number;
  toHeightCm: number;
  weightKg: MetricNormalRange;
};

type PercentileAnchor = {
  key: keyof AnthropometricPercentileProfile;
  percentile: number;
  zScore: number;
};

export type PatientGrowthRow = {
  consultationId: string;
  dateValue: number;
  dateLabel: string;
  ageMonths: number;
  weightKg: number;
  heightCm: number;
};

export type PatientGrowthChartData = {
  title: string;
  unit: string;
  interpretation: string;
  points: AnthropometricTrendPoint[];
};

const DEFAULT_WEIGHT_FOR_HEIGHT_RANGE: MetricNormalRange = { min: 6.5, max: 22.0 };

const WEIGHT_FOR_HEIGHT_BUCKETS: readonly WeightForHeightBucket[] = [
  { fromHeightCm: 65, toHeightCm: 74, weightKg: { min: 6.5, max: 9.8 } },
  { fromHeightCm: 75, toHeightCm: 84, weightKg: { min: 8.0, max: 12.0 } },
  { fromHeightCm: 85, toHeightCm: 94, weightKg: { min: 10.0, max: 15.0 } },
  { fromHeightCm: 95, toHeightCm: 104, weightKg: { min: 12.0, max: 18.5 } },
  { fromHeightCm: 105, toHeightCm: 115, weightKg: { min: 14.0, max: 22.0 } },
];

const WHO_PERCENTILE_ANCHORS: readonly PercentileAnchor[] = [
  { key: "p3", percentile: 3, zScore: -2 },
  { key: "p15", percentile: 15, zScore: -1 },
  { key: "p50", percentile: 50, zScore: 0 },
  { key: "p85", percentile: 85, zScore: 1 },
  { key: "p97", percentile: 97, zScore: 2 },
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

function getWeightForHeightRange(heightCm: number): MetricNormalRange {
  if (!Number.isFinite(heightCm)) return DEFAULT_WEIGHT_FOR_HEIGHT_RANGE;

  const bucket = WEIGHT_FOR_HEIGHT_BUCKETS.find(
    (item) => heightCm >= item.fromHeightCm && heightCm <= item.toHeightCm
  );
  return bucket?.weightKg ?? DEFAULT_WEIGHT_FOR_HEIGHT_RANGE;
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

function getWeightForHeightReferenceProfile(heightCm: number): AnthropometricPercentileProfile {
  return buildPercentileProfileFromRange(getWeightForHeightRange(heightCm));
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

function estimatePercentileFromProfile(value: number, profile: AnthropometricPercentileProfile): number {
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

function formatSigned(value: number, decimals = 1): string {
  const rounded = value.toFixed(decimals);
  return value > 0 ? `+${rounded}` : rounded;
}

function getZoneSummaryCopy(zone: AnthropometricZone): string {
  if (zone === "green") return "dentro del rango esperado";
  if (zone === "yellow") return "en zona de vigilancia";
  return "en zona de alerta";
}

function toSvgPath(points: Array<{ x: number; y: number }>): string {
  if (!points.length) return "";

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
}

export function buildPatientGrowthRows(params: {
  patientId: string;
  birthDate: Date;
  consultations: Consultation[];
  anthropometricData: AnthropometricData[];
}): PatientGrowthRow[] {
  const { patientId, birthDate, consultations, anthropometricData } = params;

  const anthropometricByConsultationId = new Map(
    anthropometricData.map((item) => [item.consultationId, item] as const)
  );

  return consultations
    .filter((consultation) => consultation.patientId === patientId)
    .map((consultation) => {
      const anthropometric = anthropometricByConsultationId.get(consultation.consultationId) ?? null;
      if (!anthropometric) return null;
      if (!Number.isFinite(anthropometric.weightKg) || !Number.isFinite(anthropometric.heightM)) return null;
      if (anthropometric.heightM <= 0) return null;

      return {
        consultationId: consultation.consultationId,
        dateValue: consultation.date.getTime(),
        dateLabel: formatDate(consultation.date),
        ageMonths: calculateAgeInMonths(birthDate, consultation.date),
        weightKg: anthropometric.weightKg,
        heightCm: Number((anthropometric.heightM * 100).toFixed(1)),
      } satisfies PatientGrowthRow;
    })
    .filter((row): row is PatientGrowthRow => row !== null)
    .sort((first, second) => first.dateValue - second.dateValue);
}

export function buildWeightForHeightTrendPoints(rows: PatientGrowthRow[]): AnthropometricTrendPoint[] {
  return rows.map((row) => {
    const percentileProfile = getWeightForHeightReferenceProfile(row.heightCm);
    const percentile = estimatePercentileFromProfile(row.weightKg, percentileProfile);
    const zScore = estimateZScoreFromPercentiles(row.weightKg, percentileProfile);

    return {
      dateLabel: row.dateLabel,
      ageLabel: formatPediatricAge(row.ageMonths),
      actual: row.weightKg,
      percentiles: percentileProfile,
      zone: getZoneFromPercentile(percentile),
      percentile,
      zScore,
    };
  });
}

export function buildWeightForHeightInterpretation(points: AnthropometricTrendPoint[]): string {
  if (!points.length) return "Sin datos antropometricos para construir la curva de crecimiento.";

  const latestPoint = points[points.length - 1];
  const previousPoint = points.length > 1 ? points[points.length - 2] : null;

  if (!previousPoint) {
    return `Peso/Talla actual ${latestPoint.actual.toFixed(2)} kg, percentil ${latestPoint.percentile.toFixed(
      1
    )}, Puntaje Z ${latestPoint.zScore.toFixed(2)} (${getZoneSummaryCopy(latestPoint.zone)}).`;
  }

  const percentileDelta = latestPoint.percentile - previousPoint.percentile;
  const trendCopy =
    percentileDelta <= -10
      ? "descenso importante frente al control anterior."
      : percentileDelta <= -4
        ? "descenso leve frente al control anterior."
        : percentileDelta >= 8
          ? "mejora de la posicion en la curva."
          : "trayectoria estable.";

  return `Peso/Talla actual ${latestPoint.actual.toFixed(2)} kg, percentil ${latestPoint.percentile.toFixed(
    1
  )}, Puntaje Z ${latestPoint.zScore.toFixed(2)} (${getZoneSummaryCopy(
    latestPoint.zone
  )}). Variación reciente: ${formatSigned(percentileDelta)} percentiles (${trendCopy})`;
}

export function buildWeightForHeightChartData(rows: PatientGrowthRow[]): PatientGrowthChartData {
  const points = buildWeightForHeightTrendPoints(rows);
  return {
    title: "Posicion en curva de crecimiento (Peso/Talla)",
    unit: "kg",
    interpretation: buildWeightForHeightInterpretation(points),
    points,
  };
}

export function buildGrowthChartSvgMarkup(
  title: string,
  unit: string,
  points: AnthropometricTrendPoint[]
): string {
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
  const domainMax = maxValue + padding;
  const domainSpan = Math.max(domainMax - (minValue - padding), 1);

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

  const ticks = Array.from({ length: 5 }, (_, index) => {
    const factor = index / 4;
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
          return `
            <circle
              cx="${point.x.toFixed(2)}"
              cy="${point.y.toFixed(2)}"
              r="${isLatest ? 5.5 : 4}"
              fill="${isLatest ? latestColor : "#1f5ea8"}"
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
