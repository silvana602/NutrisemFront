import { ArrowDown, Target } from "lucide-react";

import { Card } from "@/components/ui/Card";

import type { ZoneCopy, ZoneLevel } from "../types";
import { getZoneArrowPosition } from "../utils/patientDashboard.utils";

type PatientStatusCardProps = {
  zone: ZoneLevel;
  zoneCopy: ZoneCopy;
  dateLabel: string | null;
};

export function PatientStatusCard({ zone, zoneCopy, dateLabel }: PatientStatusCardProps) {
  return (
    <Card className="p-5">
      <header className="mb-3 flex items-center gap-2">
        <Target size={18} className="text-nutri-primary" aria-hidden />
        <h2 className="text-lg font-semibold text-nutri-primary">Semaforo del estado actual</h2>
      </header>

      <p className="text-sm text-nutri-dark-grey">
        <span className="font-semibold">{zoneCopy.label}:</span> {zoneCopy.message}
      </p>

      <div className="relative mt-8">
        <div className="h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />
        <div
          className="absolute -top-5 flex -translate-x-1/2 items-center"
          style={{ left: getZoneArrowPosition(zone) }}
        >
          <ArrowDown size={18} className="text-nutri-primary" aria-hidden />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-semibold text-nutri-dark-grey/70">
        <span>Bien</span>
        <span>Cuidado</span>
        <span>Atencion</span>
      </div>

      <p className="mt-3 text-xs text-nutri-dark-grey/70">
        Basado en tu evaluacion mas reciente ({dateLabel ?? "sin fecha"}).
      </p>
    </Card>
  );
}
