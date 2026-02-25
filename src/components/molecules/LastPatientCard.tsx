import Link from "next/link";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

export type LastPatientTrendDirection = "up" | "down" | "stable" | "no-data";

export type LastPatientCardData = {
  name: string;
  parentName: string;
  idCard: string;
  age: string;
  weight: string;
  gender: string;
  height: string;
  status: string;
  zScore: string;
  trendDirection: LastPatientTrendDirection;
  trendLabel: string;
  consultationDate: string;
  diagnosisHref?: string;
};

function TrendIcon({ direction }: { direction: LastPatientTrendDirection }) {
  if (direction === "up") return <TrendingUp size={18} className="text-emerald-700" />;
  if (direction === "down") return <TrendingDown size={18} className="text-rose-700" />;
  return <Minus size={18} className="text-nutri-dark-grey" />;
}

export const LastPatientCard = ({ patient }: { patient: LastPatientCardData }) => (
  <article className="nutri-clinician-surface p-4 sm:p-5">
    <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
          Ultimo paciente atendido
        </p>
        <h3 className="text-lg font-semibold text-nutri-primary">{patient.name}</h3>
      </div>
      <span className="inline-flex rounded-full border border-nutri-primary/20 bg-nutri-off-white px-3 py-1 text-xs font-semibold text-nutri-primary">
        {patient.status}
      </span>
    </header>

    <div className="grid grid-cols-1 gap-2 text-sm text-nutri-dark-grey sm:grid-cols-2">
      <p>
        <span className="font-semibold">Tutor:</span> {patient.parentName}
      </p>
      <p>
        <span className="font-semibold">CI:</span> {patient.idCard}
      </p>
      <p>
        <span className="font-semibold">Edad:</span> {patient.age}
      </p>
      <p>
        <span className="font-semibold">Sexo:</span> {patient.gender}
      </p>
      <p>
        <span className="font-semibold">Peso:</span> {patient.weight}
      </p>
      <p>
        <span className="font-semibold">Talla:</span> {patient.height}
      </p>
      <p className="sm:col-span-2">
        <span className="font-semibold">Fecha ultima consulta:</span> {patient.consultationDate}
      </p>
    </div>

    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div
        className={cn(
          "rounded-lg border px-3 py-2",
          patient.trendDirection === "up" && "border-emerald-200 bg-emerald-50",
          patient.trendDirection === "down" && "border-rose-200 bg-rose-50",
          patient.trendDirection !== "up" &&
            patient.trendDirection !== "down" &&
            "nutri-clinician-surface-soft border-nutri-light-grey"
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
          Tendencia de peso
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-nutri-dark-grey">
          <TrendIcon direction={patient.trendDirection} />
          {patient.trendLabel}
        </p>
      </div>

      <div className="nutri-clinician-surface-soft rounded-lg border border-nutri-light-grey px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
          Z-score
        </p>
        <p className="mt-1 text-sm font-semibold text-nutri-dark-grey">{patient.zScore}</p>
      </div>
    </div>

    {patient.diagnosisHref ? (
      <Link
        href={patient.diagnosisHref}
        className="mt-4 inline-flex items-center rounded-lg border border-nutri-primary/20 bg-nutri-white px-3 py-2 text-sm font-semibold text-nutri-primary transition-colors hover:bg-nutri-off-white"
      >
        Ver diagnostico
      </Link>
    ) : (
      <p className="mt-4 text-sm text-nutri-dark-grey/80">No hay diagnostico disponible para este registro.</p>
    )}
  </article>
);
