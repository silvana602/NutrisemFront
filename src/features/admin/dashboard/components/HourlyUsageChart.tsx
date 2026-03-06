import type { HourlyActivityPoint } from "../types";

type HourlyUsageChartProps = {
  points: HourlyActivityPoint[];
};

export function HourlyUsageChart({ points }: HourlyUsageChartProps) {
  if (points.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-nutri-light-grey/80 bg-white/80 p-4 text-sm text-nutri-dark-grey/80">
        Sin datos de actividad por hora.
      </div>
    );
  }

  const width = 760;
  const height = 260;
  const padding = { top: 18, right: 16, bottom: 40, left: 30 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...points.map((point) => point.value));

  const chartPoints = points.map((point, index) => {
    const x = padding.left + (index / (points.length - 1)) * plotWidth;
    const y = padding.top + (1 - point.value / maxValue) * plotHeight;
    return { ...point, x, y };
  });

  const linePath = chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const firstPoint = chartPoints[0];
  const lastPoint = chartPoints[chartPoints.length - 1];
  const baselineY = padding.top + plotHeight;
  const areaPath = `${linePath} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`;
  const axisHours = new Set([0, 6, 12, 18, 23]);

  return (
    <div className="mt-4 rounded-xl border border-nutri-light-grey/80 bg-white/80 p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[250px] w-full" role="img" aria-label="Curva de uso por horas">
        {[0, 1, 2, 3, 4].map((index) => {
          const y = padding.top + (index / 4) * plotHeight;
          return (
            <line
              key={`grid-${index}`}
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              className="stroke-nutri-light-grey/70"
              strokeWidth={1}
            />
          );
        })}

        <path d={areaPath} fill="rgba(86,124,141,0.16)" />
        <path d={linePath} fill="none" stroke="#172A3A" strokeWidth={2.4} />

        {chartPoints.map((point) => (
          <circle
            key={`point-${point.hour}`}
            cx={point.x}
            cy={point.y}
            r={point.value > 0 ? 2.6 : 1.5}
            fill={point.value > 0 ? "#567C8D" : "rgba(86,124,141,0.35)"}
          />
        ))}

        {chartPoints
          .filter((point) => axisHours.has(point.hour))
          .map((point) => (
            <text
              key={`hour-${point.hour}`}
              x={point.x}
              y={height - 12}
              textAnchor="middle"
              className="fill-nutri-dark-grey/75"
              style={{ fontSize: 11, fontWeight: 600 }}
            >
              {point.label}
            </text>
          ))}
      </svg>
    </div>
  );
}
