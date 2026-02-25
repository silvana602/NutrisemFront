import { Card } from "@/components/ui/Card";

export function MetricBox({ label, value }: { label: string; value: number }) {
  return (
    <Card className="nutri-platform-stat p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-nutri-dark-grey/70">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold leading-none text-nutri-primary">{value}</p>
    </Card>
  );
}
