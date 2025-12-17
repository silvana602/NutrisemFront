import { MetricBox } from "../atoms/MetricBox";

export function MetricsGrid( {metrics}: { metrics: { label: string; value: number }[] } ) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {metrics.map((m, idx) => (
      <MetricBox key={idx} label={m.label} value={m.value} />
    ))}
    </div>
  );
}
