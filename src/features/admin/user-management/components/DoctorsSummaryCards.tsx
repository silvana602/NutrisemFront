import type { DoctorPerformanceSummary } from "../types";
import { formatMinutesLabel } from "../utils";

type DoctorsSummaryCardsProps = {
  summary: DoctorPerformanceSummary;
};

export function DoctorsSummaryCards({ summary }: DoctorsSummaryCardsProps) {
  const cards = [
    {
      label: "Médicos registrados",
      value: summary.totalMedicos.toString(),
    },
    {
      label: "Médicos activos",
      value: `${summary.medicosActivos} activos / ${summary.medicosInactivos} inactivos`,
    },
    {
      label: "Consultas realizadas",
      value: summary.totalConsultas.toString(),
    },
    {
      label: "Promedio global por paciente",
      value: formatMinutesLabel(summary.promedioGlobalMinutos),
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="nutri-platform-stat px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            {card.label}
          </p>
          <p className="mt-1 text-lg font-semibold text-nutri-primary">{card.value}</p>
        </article>
      ))}
    </section>
  );
}
