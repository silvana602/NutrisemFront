import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AnthropometricTrendChart } from "@/components/organisms/clinician/diagnosis/AnthropometricTrendChart";

import type { PatientDiagnosisHistoryRow } from "../types";
import { formatMetric } from "../utils";
import { PatientDiagnosisStatusIndicator } from "./PatientDiagnosisStatusIndicator";

type PatientDiagnosisSummaryCardProps = {
  row: PatientDiagnosisHistoryRow;
  isDownloading: boolean;
  onDownloadReport: () => void;
  onExpandChart: () => void;
};

export function PatientDiagnosisSummaryCard({
  row,
  isDownloading,
  onDownloadReport,
  onExpandChart,
}: PatientDiagnosisSummaryCardProps) {
  return (
    <Card className="p-5">
      <header className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-nutri-primary">Resumen del diagnóstico</h2>
          <div className="flex flex-wrap items-center gap-2">
            <PatientDiagnosisStatusIndicator status={row.nutritionalStatus} tone={row.statusTone} />
            <span className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
              Consulta Nro. {row.consultationNumber}
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          className="px-4 py-2 text-xs sm:text-sm"
          onClick={onDownloadReport}
          disabled={isDownloading}
        >
          {isDownloading ? "Generando informe..." : "Descargar Informe Completo"}
        </Button>
      </header>

      <section className="grid grid-cols-1 gap-2 text-sm text-nutri-dark-grey sm:grid-cols-2 lg:grid-cols-3">
        <div className="nutri-platform-surface-soft rounded-lg px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">Fecha</p>
          <p className="mt-1 font-semibold">{row.dateLabel}</p>
        </div>
        <div className="nutri-platform-surface-soft rounded-lg px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">Motivo</p>
          <p className="mt-1 font-semibold">{row.reason}</p>
        </div>
        <div className="nutri-platform-surface-soft rounded-lg px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Atendido por
          </p>
          <p className="mt-1 font-semibold">{row.clinicianName}</p>
        </div>
      </section>

      <section className="nutri-platform-surface mt-4 p-3 sm:p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
          Resumen de consulta
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-nutri-dark-grey sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">Peso</p>
            <p className="mt-1 font-semibold">{formatMetric(row.vitals.weightKg, "kg")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">Talla</p>
            <p className="mt-1 font-semibold">{formatMetric(row.vitals.heightM, "m")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
              Perimetro cefalico
            </p>
            <p className="mt-1 font-semibold">{formatMetric(row.vitals.headCircumferenceCm, "cm")}</p>
          </div>
        </div>
      </section>

      <section className="nutri-platform-surface mt-4 p-3 sm:p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
          Resumen del diagnóstico
        </h3>
        <p className="mt-2 text-sm text-nutri-dark-grey">{row.diagnosisSummary}</p>

        <div className="mt-3 space-y-2 text-sm text-nutri-dark-grey">
          <p>
            <span className="font-semibold">Recomendación médica:</span> {row.medicalRecommendation}
          </p>
          <p>
            <span className="font-semibold">Recomendación alimentaria:</span>{" "}
            {row.dietaryRecommendation}
          </p>
        </div>
      </section>

      <section className="nutri-platform-surface mt-4 p-3 sm:p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Grafico de posicion
          </h3>
          <p className="text-xs text-nutri-dark-grey/80">Haz clic para ampliar</p>
        </div>

        <AnthropometricTrendChart
          title={row.chart.title}
          unit={row.chart.unit}
          points={row.chart.points}
          interpretation={row.chart.interpretation}
          className="cursor-zoom-in transition-shadow hover:shadow-md"
          onClick={onExpandChart}
        />
      </section>
    </Card>
  );
}
