export type LandingCapabilityId =
  | "continuous-monitoring"
  | "smart-alerts"
  | "clinical-network"
  | "actionable-reports";

export type LandingCapability = {
  capabilityId: LandingCapabilityId;
  title: string;
  description: string;
  badge: string;
};

export type LandingPulseMetricTone = "stable" | "up" | "attention";

export type LandingPulseMetric = {
  metricId: string;
  label: string;
  value: string;
  delta: string;
  tone: LandingPulseMetricTone;
};

export type LandingTrendSeries = {
  seriesId: string;
  title: string;
  subtitle: string;
  tone: "primary" | "secondary";
  values: number[];
};

export type LandingWorkflowStep = {
  stepId: string;
  title: string;
  description: string;
};
