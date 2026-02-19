"use client";

import React from "react";

export type AnthropometricPercentileProfile = {
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
};

export type AnthropometricZone = "green" | "yellow" | "red";

export type AnthropometricTrendPoint = {
  dateLabel: string;
  ageLabel: string;
  actual: number;
  percentiles: AnthropometricPercentileProfile;
  zone: AnthropometricZone;
  percentile: number;
  zScore: number;
};

type AnthropometricTrendChartProps = {
  title: string;
  unit: string;
  points: AnthropometricTrendPoint[];
  interpretation: string;
  className?: string;
  svgClassName?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
};

const VIEWBOX_WIDTH = 920;
const VIEWBOX_HEIGHT = 300;
const MARGIN_LEFT = 52;
const MARGIN_RIGHT = 18;
const MARGIN_TOP = 16;
const MARGIN_BOTTOM = 52;
const CHART_WIDTH = VIEWBOX_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const CHART_HEIGHT = VIEWBOX_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;

const PERCENTILE_CURVES: ReadonlyArray<{
  key: keyof AnthropometricPercentileProfile;
  label: string;
  stroke: string;
  dasharray?: string;
}> = [
  { key: "p3", label: "P3", stroke: "#b42318", dasharray: "4 4" },
  { key: "p15", label: "P15", stroke: "#d18400", dasharray: "6 3" },
  { key: "p50", label: "P50", stroke: "#2f7a36" },
  { key: "p85", label: "P85", stroke: "#d18400", dasharray: "6 3" },
  { key: "p97", label: "P97", stroke: "#b42318", dasharray: "4 4" },
] as const;

const ZONE_STYLES: Record<AnthropometricZone, { label: string; color: string }> = {
  green: { label: "zona verde", color: "#2f7a36" },
  yellow: { label: "zona amarilla", color: "#d18400" },
  red: { label: "zona roja", color: "#b42318" },
};

function toPath(points: Array<{ x: number; y: number }>): string {
  if (!points.length) return "";

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
}

function formatTick(value: number): string {
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

export function AnthropometricTrendChart({
  title,
  unit,
  points,
  interpretation,
  className = "",
  svgClassName = "h-[260px] w-full",
  onClick,
  onDoubleClick,
}: AnthropometricTrendChartProps) {
  if (!points.length) {
    return (
      <article className={`rounded-lg border border-nutri-light-grey bg-nutri-white p-4 ${className}`}>
        <p className="text-sm font-semibold text-nutri-primary">{title}</p>
        <p className="mt-2 text-sm text-nutri-dark-grey">
          No hay datos suficientes para construir este grafico.
        </p>
      </article>
    );
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
    if (points.length === 1) return MARGIN_LEFT + CHART_WIDTH / 2;
    return MARGIN_LEFT + (index / (points.length - 1)) * CHART_WIDTH;
  };
  const yForValue = (value: number): number => {
    return MARGIN_TOP + ((domainMax - value) / domainSpan) * CHART_HEIGHT;
  };

  const actualPoints = points.map((point, index) => ({
    x: xForIndex(index),
    y: yForValue(point.actual),
  }));
  const p3Points = points.map((point, index) => ({
    x: xForIndex(index),
    y: yForValue(point.percentiles.p3),
  }));
  const p15Points = points.map((point, index) => ({
    x: xForIndex(index),
    y: yForValue(point.percentiles.p15),
  }));
  const p50Points = points.map((point, index) => ({
    x: xForIndex(index),
    y: yForValue(point.percentiles.p50),
  }));
  const p85Points = points.map((point, index) => ({
    x: xForIndex(index),
    y: yForValue(point.percentiles.p85),
  }));
  const p97Points = points.map((point, index) => ({
    x: xForIndex(index),
    y: yForValue(point.percentiles.p97),
  }));

  const expectedRangeAreaPath = [
    toPath(p85Points),
    toPath([...p15Points].reverse()).replace(/^M/, "L"),
    "Z",
  ].join(" ");

  const actualLinePath = toPath(actualPoints);
  const percentilePaths: Record<keyof AnthropometricPercentileProfile, string> = {
    p3: toPath(p3Points),
    p15: toPath(p15Points),
    p50: toPath(p50Points),
    p85: toPath(p85Points),
    p97: toPath(p97Points),
  };

  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, index) => {
    const factor = index / (tickCount - 1);
    const value = domainMax - factor * domainSpan;
    const y = yForValue(value);
    return { value, y };
  });

  const latestPoint = points[points.length - 1];
  const latestPointStyle = ZONE_STYLES[latestPoint.zone];

  return (
    <article
      className={`rounded-lg border border-nutri-light-grey bg-nutri-white p-4 ${className}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <header className="mb-3 space-y-1">
        <p className="text-sm font-semibold text-nutri-primary">{title}</p>
        <p className="text-xs text-nutri-dark-grey/80">
          Curvas OMS: P3, P15, P50, P85 y P97 | Azul: evolucion del paciente
        </p>
        <p className="text-xs text-nutri-dark-grey/80">
          Punto actual: {latestPointStyle.label} | Percentil {latestPoint.percentile.toFixed(1)} |
          Z-score {latestPoint.zScore.toFixed(2)}
        </p>
      </header>

      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className={svgClassName}>
        <rect x={0} y={0} width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="#ffffff" />

        {ticks.map((tick) => (
          <g key={tick.y}>
            <line
              x1={MARGIN_LEFT}
              x2={VIEWBOX_WIDTH - MARGIN_RIGHT}
              y1={tick.y}
              y2={tick.y}
              stroke="rgba(150, 150, 150, 0.2)"
              strokeWidth={1}
            />
            <text
              x={MARGIN_LEFT - 8}
              y={tick.y + 4}
              textAnchor="end"
              fontSize={11}
              fill="#5d6060"
            >
              {formatTick(tick.value)}
            </text>
          </g>
        ))}

        <path d={expectedRangeAreaPath} fill="rgba(92, 167, 102, 0.18)" stroke="none" />

        {PERCENTILE_CURVES.map((curve) => (
          <path
            key={curve.key}
            d={percentilePaths[curve.key]}
            fill="none"
            stroke={curve.stroke}
            strokeWidth={curve.key === "p50" ? 2.4 : 1.6}
            strokeDasharray={curve.dasharray}
          />
        ))}
        <path d={actualLinePath} fill="none" stroke="#1f5ea8" strokeWidth={3} />

        {actualPoints.map((point, index) => (
          // The latest point gets triage color to make the current risk visually explicit.
          <circle
            key={`${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r={index === points.length - 1 ? 5.5 : 4}
            fill={index === points.length - 1 ? latestPointStyle.color : "#1f5ea8"}
            stroke="#ffffff"
            strokeWidth={1.5}
          >
            <title>
              {`${points[index].dateLabel} | ${points[index].ageLabel} | ${points[
                index
              ].actual.toFixed(2)} ${unit} | P${points[index].percentile.toFixed(1)} | Z ${
                points[index].zScore.toFixed(2)
              }`}
            </title>
          </circle>
        ))}

        {PERCENTILE_CURVES.map((curve, index) => {
          const labelY = MARGIN_TOP + 12 + index * 14;
          return (
            <g key={`legend-${curve.key}`}>
              <line
                x1={VIEWBOX_WIDTH - MARGIN_RIGHT - 95}
                y1={labelY}
                x2={VIEWBOX_WIDTH - MARGIN_RIGHT - 72}
                y2={labelY}
                stroke={curve.stroke}
                strokeWidth={curve.key === "p50" ? 2.4 : 1.6}
                strokeDasharray={curve.dasharray}
              />
              <text
                x={VIEWBOX_WIDTH - MARGIN_RIGHT - 66}
                y={labelY + 3}
                textAnchor="start"
                fontSize={10}
                fill="#3a3f45"
              >
                {curve.label}
              </text>
            </g>
          );
        })}

        {points.map((point, index) => {
          const x = xForIndex(index);
          const shouldShow =
            points.length <= 6 ||
            index === 0 ||
            index === points.length - 1 ||
            index % Math.ceil(points.length / 5) === 0;

          if (!shouldShow) return null;

          return (
            <text
              key={`${point.dateLabel}-${index}`}
              x={x}
              y={VIEWBOX_HEIGHT - 18}
              textAnchor="middle"
              fontSize={10}
              fill="#5d6060"
            >
              {point.dateLabel}
            </text>
          );
        })}

        <text
          x={MARGIN_LEFT - 32}
          y={MARGIN_TOP - 2}
          textAnchor="start"
          fontSize={11}
          fill="#5d6060"
        >
          {unit}
        </text>
      </svg>

      <p className="mt-2 text-xs text-nutri-dark-grey">{interpretation}</p>
    </article>
  );
}

export default AnthropometricTrendChart;
