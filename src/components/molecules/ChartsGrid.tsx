import { Card } from "@/components/ui/Card";

export function ChartsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {[1, 2, 3, 4].map((index) => (
        <Card
          key={index}
          className="p-4 h-64 rounded-xl shadow"
        >
          <div
            className="h-full w-full rounded-xl bg-nutri-light-grey opacity-70"
          />
        </Card>
      ))}
    </div>
  );
}
