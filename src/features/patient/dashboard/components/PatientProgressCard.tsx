import { Activity, ArrowDown, ArrowUp } from "lucide-react";

import { Card } from "@/components/ui/Card";

import type { ConsultationSnapshot, ProgressCopy, ProgressDirection } from "../types";
import { formatDelta } from "../utils/patientDashboard.utils";

type PatientProgressCardProps = {
  latestSnapshot: ConsultationSnapshot | null;
  previousSnapshot: ConsultationSnapshot | null;
  progressDirection: ProgressDirection;
  progressCopy: ProgressCopy;
};

function ProgressIcon({ direction }: { direction: ProgressDirection }) {
  if (direction === "improved") {
    return <ArrowUp size={18} className="text-emerald-700" aria-hidden />;
  }

  if (direction === "declined") {
    return <ArrowDown size={18} className="text-rose-700" aria-hidden />;
  }

  return <Activity size={18} className="text-nutri-dark-grey" aria-hidden />;
}

export function PatientProgressCard({
  latestSnapshot,
  previousSnapshot,
  progressDirection,
  progressCopy,
}: PatientProgressCardProps) {
  return (
    <Card className="p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Tendencia
          </p>
          <h2 className="text-lg font-semibold text-nutri-primary">
            Progreso vs consulta anterior
          </h2>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${progressCopy.badgeClassName}`}
        >
          <ProgressIcon direction={progressDirection} />
          {progressCopy.badgeLabel}
        </span>
      </header>

      <p className="text-sm font-semibold text-nutri-dark-grey">{progressCopy.title}</p>
      <p className="mt-1 text-sm text-nutri-dark-grey/80">{progressCopy.subtitle}</p>

      <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-nutri-dark-grey sm:grid-cols-3">
        <div className="nutri-platform-surface-soft rounded-lg px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Peso
          </p>
          <p className="mt-1 font-semibold">
            {formatDelta(latestSnapshot?.weightKg ?? null, previousSnapshot?.weightKg ?? null, "kg")}
          </p>
        </div>
        <div className="nutri-platform-surface-soft rounded-lg px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Talla
          </p>
          <p className="mt-1 font-semibold">
            {formatDelta(latestSnapshot?.heightM ?? null, previousSnapshot?.heightM ?? null, "m")}
          </p>
        </div>
        <div className="nutri-platform-surface-soft rounded-lg px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            IMC
          </p>
          <p className="mt-1 font-semibold">
            {formatDelta(latestSnapshot?.bmi ?? null, previousSnapshot?.bmi ?? null, "", 1)}
          </p>
        </div>
      </div>
    </Card>
  );
}
