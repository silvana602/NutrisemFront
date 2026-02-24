import { Card } from "@/components/ui/Card";

type PatientLatestDietaryRecommendationProps = {
  dietaryRecommendation: string;
  dateLabel: string;
  nutritionalStatus: string;
  totalSuggestedFoods: number;
};

export function PatientLatestDietaryRecommendation({
  dietaryRecommendation,
  dateLabel,
  nutritionalStatus,
  totalSuggestedFoods,
}: PatientLatestDietaryRecommendationProps) {
  return (
    <Card className="space-y-4 p-5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-nutri-primary">
          Ultima recomendacion alimentaria nutricional
        </h2>
        <span className="inline-flex w-fit rounded-full border border-nutri-primary/20 bg-nutri-off-white px-3 py-1 text-xs font-semibold text-nutri-primary">
          Consulta: {dateLabel}
        </span>
      </header>

      <div className="relative rounded-2xl border border-nutri-secondary/20 bg-gradient-to-r from-nutri-white via-nutri-off-white to-nutri-light-grey/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nutri-secondary">
          Mensaje del nutricionista
        </p>
        <p className="mt-2 text-sm leading-relaxed text-nutri-dark-grey sm:text-base">
          {dietaryRecommendation}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-nutri-light-grey bg-nutri-off-white/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Estado actual
          </p>
          <p className="mt-1 text-sm font-semibold text-nutri-primary">{nutritionalStatus}</p>
        </article>

        <article className="rounded-xl border border-nutri-light-grey bg-nutri-off-white/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Alimentos sugeridos
          </p>
          <p className="mt-1 text-sm font-semibold text-nutri-primary">{totalSuggestedFoods}</p>
        </article>

        <article className="rounded-xl border border-nutri-light-grey bg-nutri-off-white/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Objetivo del dia
          </p>
          <p className="mt-1 text-sm font-semibold text-nutri-primary">
            Cumplir porcion y frecuencia
          </p>
        </article>
      </div>
    </Card>
  );
}
