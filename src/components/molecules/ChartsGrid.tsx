import { Card } from "@/components/ui/Card";

export function ChartsGrid() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map((index) => (
        <Card key={index} className="nutri-platform-surface p-4">
          <div className="h-64 w-full rounded-xl border border-nutri-light-grey/80 bg-[linear-gradient(135deg,rgba(231,233,227,0.95)_0%,rgba(245,239,235,0.7)_100%)]" />
        </Card>
      ))}
    </div>
  );
}
