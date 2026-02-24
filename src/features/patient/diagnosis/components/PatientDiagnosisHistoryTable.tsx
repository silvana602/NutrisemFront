import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import type { PatientDiagnosisHistoryRow } from "../types";
import { PatientDiagnosisStatusIndicator } from "./PatientDiagnosisStatusIndicator";

type PatientDiagnosisHistoryTableProps = {
  rows: PatientDiagnosisHistoryRow[];
  selectedDiagnosisId: string | null;
  downloadingDiagnosisId: string | null;
  onViewSummary: (diagnosisId: string) => void;
  onDownloadPdf: (diagnosisId: string) => void;
};

export function PatientDiagnosisHistoryTable({
  rows,
  selectedDiagnosisId,
  downloadingDiagnosisId,
  onViewSummary,
  onDownloadPdf,
}: PatientDiagnosisHistoryTableProps) {
  return (
    <Card className="p-5">
      <header className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold text-nutri-primary">
          Historial de Diagnosticos (Tabla Nutrisem)
        </h2>
        <p className="text-sm text-nutri-dark-grey/80">
          El estado nutricional incluye un indicador visual para identificar mas rapido la
          evolucion.
        </p>
      </header>

      <div className="space-y-3 md:hidden">
        {rows.map((row) => {
          const isSelected = selectedDiagnosisId === row.diagnosisId;
          const isGenerating = downloadingDiagnosisId === row.diagnosisId;

          return (
            <article
              key={row.diagnosisId}
              className={`rounded-xl border p-3 ${
                isSelected
                  ? "border-nutri-secondary/40 bg-nutri-off-white/70"
                  : "border-nutri-light-grey bg-nutri-white"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                {row.dateLabel}
              </p>
              <p className="mt-1 text-sm font-semibold text-nutri-primary">{row.reason}</p>
              <div className="mt-2">
                <PatientDiagnosisStatusIndicator status={row.nutritionalStatus} tone={row.statusTone} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant={isSelected ? "primary" : "outline"}
                  className="px-3 py-1.5 text-xs"
                  onClick={() => onViewSummary(row.diagnosisId)}
                >
                  Ver Resumen
                </Button>
                <Button
                  variant="outline"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => onDownloadPdf(row.diagnosisId)}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generando..." : "Descargar PDF"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-nutri-light-grey md:block">
        <table className="min-w-[820px] table-auto text-sm">
          <thead className="bg-nutri-off-white">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/80">
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Motivo / Nota rapida</th>
              <th className="px-3 py-2">Estado nutricional</th>
              <th className="px-3 py-2">Accion</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isSelected = selectedDiagnosisId === row.diagnosisId;
              const isGenerating = downloadingDiagnosisId === row.diagnosisId;

              return (
                <tr
                  key={row.diagnosisId}
                  className={`border-t border-nutri-light-grey align-top ${
                    isSelected ? "bg-nutri-off-white/60" : "bg-nutri-white"
                  }`}
                >
                  <td className="px-3 py-3 font-semibold text-nutri-primary">{row.dateLabel}</td>
                  <td className="px-3 py-3 text-nutri-dark-grey">{row.reason}</td>
                  <td className="px-3 py-3">
                    <PatientDiagnosisStatusIndicator status={row.nutritionalStatus} tone={row.statusTone} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={isSelected ? "primary" : "outline"}
                        className="px-3 py-1.5 text-xs"
                        onClick={() => onViewSummary(row.diagnosisId)}
                      >
                        Ver Resumen
                      </Button>
                      <Button
                        variant="outline"
                        className="px-3 py-1.5 text-xs"
                        onClick={() => onDownloadPdf(row.diagnosisId)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? "Generando..." : "Descargar PDF"}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
