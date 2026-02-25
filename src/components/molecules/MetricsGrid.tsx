import { MetricBox } from "../atoms/MetricBox";

export function MetricsGrid( {metrics}: { metrics: { label: string; value: number }[] } ) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
      {metrics.map((m, idx) => (
      <MetricBox key={idx} label={m.label} value={m.value} />
    ))}
    </div>
  );
}
