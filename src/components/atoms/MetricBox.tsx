import { Card } from "@/components/ui/Card";

export function MetricBox({ label, value }: { label: string; value: number }) {
  return (
    <Card
      className="p-6 flex items-center justify-center text-lg font-semibold rounded-xl shadow-md"
    >
      #{value}
      {label}
    </Card>
  );
}
