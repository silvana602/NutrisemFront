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
        <span className="nutri-platform-surface-soft inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold text-nutri-primary">
          Última actualización: {dateLabel}
        </span>
      </header>

      <div className="space-y-3 text-sm text-nutri-dark-grey">
        <p>
          <span className="font-semibold">Estado nutricional:</span> {nutritionalStatus}
        </p>
        <p>
          <span className="font-semibold">Recomendación médica:</span> {medicalRecommendation}
        </p>
        <p>
          <span className="font-semibold">Recomendación alimentaria:</span> {dietaryRecommendation}
        </p>
      </div>
    </Card>
  );
}
