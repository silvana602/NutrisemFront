import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";

import type { AlertRecord } from "../types";

type CriticalAlertsSectionProps = {
  alerts: AlertRecord[];
  onViewDiagnosis: (patientId: string, recordId: string) => void;
};

export function CriticalAlertsSection({
  alerts,
  onViewDiagnosis,
}: CriticalAlertsSectionProps) {
  return (
    <section className="nutri-clinician-surface border-rose-200/75 bg-[linear-gradient(140deg,rgba(255,255,255,0.88)_0%,rgba(255,241,242,0.78)_100%)] p-4 sm:p-5">
      <header className="mb-3 flex items-center gap-2">
        <AlertTriangle size={18} className="text-rose-700" />
        <h2 className="text-base font-semibold text-rose-700">Alertas criticas de la semana</h2>
      </header>

      {alerts.length === 0 ? (
        <p className="text-sm text-nutri-dark-grey">
          No hay alertas criticas registradas en los ultimos 7 dias.
        </p>
      ) : (
        <div className="space-y-2">
          {alerts.map(({ item, reason }) => (
            <article
              key={`alert-${item.recordId}`}
              className="nutri-clinician-surface-soft border-rose-200/85 p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-nutri-primary">{item.patientName}</p>
                  <p className="text-xs text-nutri-dark-grey">
                    {item.dateLabel} | {item.nutritionalStatus}
                  </p>
                  <p className="text-xs text-rose-700">{reason}</p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-fit text-xs"
                  onClick={() => onViewDiagnosis(item.patientId, item.recordId)}
                >
                  Ver diagnóstico
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
