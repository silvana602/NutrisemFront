import { Card } from "@/components/ui/Card";

type PatientRecommendationsSummaryProps = {
  nutritionalStatus: string;
  dateLabel: string;
  medicalRecommendation: string;
  dietaryRecommendation: string;
};

export function PatientRecommendationsSummary({
  nutritionalStatus,
  dateLabel,
  medicalRecommendation,
  dietaryRecommendation,
}: PatientRecommendationsSummaryProps) {
  return (
    <Card className="p-5">
      <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-nutri-primary">Resumen de recomendaciones</h2>
        <span className="inline-flex w-fit rounded-full border border-nutri-primary/20 bg-nutri-off-white px-3 py-1 text-xs font-semibold text-nutri-primary">
          Ultima actualizacion: {dateLabel}
        </span>
      </header>

      <div className="space-y-3 text-sm text-nutri-dark-grey">
        <p>
          <span className="font-semibold">Estado nutricional:</span> {nutritionalStatus}
        </p>
        <p>
          <span className="font-semibold">Recomendacion medica:</span> {medicalRecommendation}
        </p>
        <p>
          <span className="font-semibold">Recomendacion alimentaria:</span> {dietaryRecommendation}
        </p>
      </div>
    </Card>
  );
}
