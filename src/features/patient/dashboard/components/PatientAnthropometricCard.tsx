import { Card } from "@/components/ui/Card";

import type { ConsultationSnapshot } from "../types";
import { formatMetric } from "../utils/patientDashboard.utils";

type PatientAnthropometricCardProps = {
  snapshot: ConsultationSnapshot | null;
};

export function PatientAnthropometricCard({ snapshot }: PatientAnthropometricCardProps) {
  if (!snapshot) {
    return (
      <Card className="p-5">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
              Ultima consulta
            </p>
            <h2 className="text-lg font-semibold text-nutri-primary">
              Datos antropometricos
            </h2>
          </div>
          <span className="rounded-full border border-nutri-primary/20 bg-nutri-off-white px-3 py-1 text-xs font-semibold text-nutri-primary">
            Sin registro
          </span>
        </header>

        <p className="text-sm text-nutri-dark-grey">
          Aun no hay consulta registrada. Cuando exista un control, veras tus datos aqui.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Ultima consulta
          </p>
          <h2 className="text-lg font-semibold text-nutri-primary">
            Datos antropometricos
          </h2>
        </div>
        <span className="rounded-full border border-nutri-primary/20 bg-nutri-off-white px-3 py-1 text-xs font-semibold text-nutri-primary">
          {snapshot.dateLabel}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-2 text-sm text-nutri-dark-grey sm:grid-cols-2">
        <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-3 py-2">
          <span className="font-semibold">Peso:</span>{" "}
          {formatMetric(snapshot.weightKg, "kg")}
        </p>
        <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-3 py-2">
          <span className="font-semibold">Talla:</span>{" "}
          {formatMetric(snapshot.heightM, "m")}
        </p>
        <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-3 py-2">
          <span className="font-semibold">IMC:</span>{" "}
          {formatMetric(snapshot.bmi, "", 1)}
        </p>
        <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-3 py-2">
          <span className="font-semibold">MUAC:</span>{" "}
          {formatMetric(snapshot.muacCm, "cm", 1)}
        </p>
        <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-3 py-2 sm:col-span-2">
          <span className="font-semibold">Perimetro cefalico:</span>{" "}
          {formatMetric(snapshot.headCircumferenceCm, "cm", 1)}
        </p>
      </div>
    </Card>
  );
}
