import { ClipboardCheck, FileClock } from "lucide-react";

import { Button } from "@/components/ui/Button";

import type {
  DashboardConsultationRecord,
  HistoricalDashboardConsultationRecord,
} from "../types";
import { formatWeight, formatZScore } from "../utils/clinicianDashboard.utils";

type RecentConsultationsSectionProps = {
  snapshotRecord: DashboardConsultationRecord | null;
  recentConsultations: HistoricalDashboardConsultationRecord[];
  onResumeConsultation: () => void;
  onOpenDiagnosis: (patientId: string, recordId: string) => void;
};

export function RecentConsultationsSection({
  snapshotRecord,
  recentConsultations,
  onResumeConsultation,
  onOpenDiagnosis,
}: RecentConsultationsSectionProps) {
  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-lg font-semibold text-nutri-dark-grey">Consultas recientes</h2>
      </header>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm">
          <header className="mb-2 flex items-center gap-2">
            <FileClock size={16} className="text-nutri-primary" />
            <h3 className="text-sm font-semibold text-nutri-primary">Ficha en curso</h3>
          </header>

          {!snapshotRecord ? (
            <p className="text-sm text-nutri-dark-grey">No hay fichas pendientes para retomar.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-nutri-dark-grey">
                {snapshotRecord.patientName} | {snapshotRecord.dateLabel}
              </p>
              <p className="text-xs text-nutri-dark-grey/80">
                Peso: {formatWeight(snapshotRecord.weightKg)} | Z-score:{" "}
                {formatZScore(snapshotRecord.zScore)}
              </p>
              <Button
                type="button"
                variant="outline"
                className="text-xs"
                onClick={onResumeConsultation}
              >
                Retomar consulta
              </Button>
            </div>
          )}
        </article>

        <article className="rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm">
          <header className="mb-2 flex items-center gap-2">
            <ClipboardCheck size={16} className="text-nutri-primary" />
            <h3 className="text-sm font-semibold text-nutri-primary">Pacientes recien atendidos</h3>
          </header>

          {recentConsultations.length === 0 ? (
            <p className="text-sm text-nutri-dark-grey">No hay consultas registradas.</p>
          ) : (
            <div className="space-y-2">
              {recentConsultations.map((item) => (
                <div
                  key={`recent-${item.recordId}`}
                  className="flex flex-col gap-2 rounded-lg border border-nutri-light-grey bg-nutri-off-white/60 p-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-nutri-dark-grey">{item.patientName}</p>
                    <p className="text-xs text-nutri-dark-grey/80">
                      {item.dateLabel} | {item.nutritionalStatus}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-fit text-xs"
                    onClick={() => onOpenDiagnosis(item.patientId, item.recordId)}
                  >
                    Abrir diagnostico
                  </Button>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
