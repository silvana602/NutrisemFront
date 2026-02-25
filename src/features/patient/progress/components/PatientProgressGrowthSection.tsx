import { Card } from "@/components/ui/Card";
import { AnthropometricTrendChart } from "@/components/organisms/clinician/diagnosis/AnthropometricTrendChart";

import type { PatientProgressGrowthIndicator, PatientProgressIndicatorId } from "../types";

type PatientProgressGrowthSectionProps = {
  indicators: PatientProgressGrowthIndicator[];
  latestDateLabel: string;
  onExpandChart: (indicatorId: PatientProgressIndicatorId) => void;
};

export function PatientProgressGrowthSection({
  indicators,
  latestDateLabel,
  onExpandChart,
}: PatientProgressGrowthSectionProps) {
  return (
    <Card className="p-5">
      <header className="mb-4 space-y-2">
        <h2 className="text-lg font-semibold text-nutri-primary">
          Grafico de estado nutricional (Curvas OMS)
        </h2>
        <p className="text-sm text-nutri-dark-grey/80">
          Eje X: edad del niño | Eje Y: peso o talla. Las líneas de referencia muestran percentiles
          OMS y la linea azul representa cada control del paciente.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {indicators.map((indicator) => (
          <article
            key={indicator.id}
            className="nutri-platform-surface rounded-xl p-3 sm:p-4"
          >
            <AnthropometricTrendChart
              title={indicator.title}
              unit={indicator.unit}
              points={indicator.points}
              interpretation={indicator.latestMessage}
              className="cursor-zoom-in transition-shadow hover:shadow-md"
              onClick={() => onExpandChart(indicator.id)}
            />

            <p className="mt-2 text-xs text-nutri-dark-grey/80">
              Última lectura registrada: {latestDateLabel}. Clic para ampliar.
            </p>

            {indicator.highlightLabel ? (
              <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                {indicator.highlightLabel}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </Card>
  );
}
