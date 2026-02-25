import type {
  LandingCapability,
  LandingPulseMetric,
  LandingTrendSeries,
  LandingWorkflowStep,
} from "../types";

export const LANDING_CAPABILITIES: LandingCapability[] = [
  {
    capabilityId: "continuous-monitoring",
    title: "Seguimiento continuo",
    description:
      "Registra mediciones y evoluciones por paciente para detectar variaciones a tiempo.",
    badge: "Control diario",
  },
  {
    capabilityId: "smart-alerts",
    title: "Alertas tempranas",
    description:
      "Prioriza casos criticos y senala cambios que requieren intervencion nutricional inmediata.",
    badge: "Riesgo detectado",
  },
  {
    capabilityId: "clinical-network",
    title: "Red profesional",
    description:
      "Conecta equipos clínicos, historial y contexto familiar en una sola vista operativa.",
    badge: "Trabajo colaborativo",
  },
  {
    capabilityId: "actionable-reports",
    title: "Reportes accionables",
    description:
      "Transforma datos en informes claros para decisiones de campo y seguimiento institucional.",
    badge: "Decision rapida",
  },
];

export const LANDING_PULSE_METRICS: LandingPulseMetric[] = [
  {
    metricId: "active-controls",
    label: "Controles activos",
    value: "1,284",
    delta: "+8.2% semanal",
    tone: "up",
  },
  {
    metricId: "critical-alerts",
    label: "Alertas criticas",
    value: "37",
    delta: "Seguimiento en curso",
    tone: "attention",
  },
  {
    metricId: "resolved-cases",
    label: "Casos estabilizados",
    value: "92%",
    delta: "Tendencia estable",
    tone: "stable",
  },
];

export const LANDING_TREND_YEARS = ["2021", "2022", "2023", "2024", "2025"];

export const LANDING_TREND_SERIES: LandingTrendSeries[] = [
  {
    seriesId: "malnutrition",
    title: "Desnutricion infantil",
    subtitle: "Evolucion porcentual nacional",
    tone: "secondary",
    values: [22, 20, 18, 16, 14],
  },
  {
    seriesId: "overweight",
    title: "Sobrepeso infantil",
    subtitle: "Evolucion porcentual nacional",
    tone: "primary",
    values: [12, 14, 16, 18, 19],
  },
];

export const LANDING_WORKFLOW_STEPS: LandingWorkflowStep[] = [
  {
    stepId: "capture",
    title: "Captura",
    description: "Registra datos antropometricos y clínicos en minutos.",
  },
  {
    stepId: "analyze",
    title: "Analiza",
    description: "Visualiza estado nutricional y tendencias historicas.",
  },
  {
    stepId: "recommend",
    title: "Interviene",
    description: "Define recomendaciones médicas y alimentarias personalizadas.",
  },
  {
    stepId: "follow-up",
    title: "Da seguimiento",
    description: "Monitorea cumplimiento y ajusta estrategia por paciente.",
  },
];

export function buildScaledBarHeights(values: number[], maxHeight = 170): number[] {
  const maxValue = Math.max(...values, 1);

  return values.map((value) => {
    const normalized = value / maxValue;
    return Math.max(28, Math.round(normalized * maxHeight));
  });
}

export function getTrendDeltaLabel(values: number[]): string {
  if (values.length < 2) return "Sin tendencia";

  const first = values[0];
  const last = values[values.length - 1];
  const delta = Number((last - first).toFixed(1));

  if (delta > 0) return `+${delta.toFixed(1)} pts`;
  if (delta < 0) return `${delta.toFixed(1)} pts`;
  return "0.0 pts";
}
