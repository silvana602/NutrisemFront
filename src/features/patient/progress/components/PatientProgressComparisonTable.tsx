import { AlertTriangle, ArrowUp, Minus } from "lucide-react";

import { Card } from "@/components/ui/Card";

import type { PatientProgressComparisonRow, PatientProgressTrendTone } from "../types";
import { formatMetricValue } from "../utils";

type PatientProgressComparisonTableProps = {
  rows: PatientProgressComparisonRow[];
};

function TrendBadge({ tone }: { tone: PatientProgressTrendTone }) {
  if (tone === "up") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
        <ArrowUp size={14} aria-hidden />
        Evolucion
      </span>
    );
  }

  if (tone === "alert") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
        <AlertTriangle size={14} aria-hidden />
        Alerta
      </span>
    );
  }

  return (
    <span className="nutri-platform-surface-soft inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-nutri-dark-grey">
      <Minus size={14} aria-hidden />
      Estable
    </span>
  );
}

export function PatientProgressComparisonTable({ rows }: PatientProgressComparisonTableProps) {
  return (
    <Card className="p-5">
      <header className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold text-nutri-primary">Tabla comparativa de evolucion</h2>
        <p className="text-sm text-nutri-dark-grey/80">
          Visualiza el cambio entre el control anterior y el actual, con una meta clara para el
          proximo control.
        </p>
      </header>

      <div className="space-y-3 lg:hidden">
        {rows.map((row) => (
          <article key={row.id} className="nutri-platform-surface rounded-xl p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-nutri-primary">{row.label}</h3>
              <TrendBadge tone={row.tone} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-nutri-dark-grey">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">Inicio</p>
                <p>{formatMetricValue(row.startValue, row.unit)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">Anterior</p>
                <p>{formatMetricValue(row.previousValue, row.unit)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">Actual</p>
                <p>{formatMetricValue(row.currentValue, row.unit)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">Meta</p>
                <p>{formatMetricValue(row.goalValue, row.unit)}</p>
              </div>
            </div>

            <p className="mt-2 text-sm font-semibold text-nutri-primary">Cambio: {row.deltaLabel}</p>
          </article>
        ))}
      </div>

      <div className="nutri-platform-surface hidden overflow-x-auto rounded-xl lg:block">
        <table className="min-w-[980px] table-auto text-sm">
          <thead className="bg-nutri-off-white">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/80">
              <th className="px-3 py-2">Indicador</th>
              <th className="px-3 py-2">Inicio (Dia 1)</th>
              <th className="px-3 py-2">Anterior</th>
              <th className="px-3 py-2">Actual</th>
              <th className="px-3 py-2">Tu meta para el proximo control</th>
              <th className="px-3 py-2">Cambio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-nutri-light-grey bg-transparent align-top">
                <td className="px-3 py-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-nutri-primary">{row.label}</p>
                    <TrendBadge tone={row.tone} />
                  </div>
                </td>
                <td className="px-3 py-3 text-nutri-dark-grey">
                  {formatMetricValue(row.startValue, row.unit)}
                </td>
                <td className="px-3 py-3 text-nutri-dark-grey">
                  {formatMetricValue(row.previousValue, row.unit)}
                </td>
                <td className="px-3 py-3 text-nutri-dark-grey">
                  {formatMetricValue(row.currentValue, row.unit)}
                </td>
                <td className="px-3 py-3 text-nutri-dark-grey">
                  {formatMetricValue(row.goalValue, row.unit)}
                </td>
                <td className="px-3 py-3 font-semibold text-nutri-primary">{row.deltaLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
