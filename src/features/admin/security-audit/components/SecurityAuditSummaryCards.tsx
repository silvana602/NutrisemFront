import type { SecurityAuditSummary } from "../types";
import { formatInteger } from "../utils";

type SecurityAuditSummaryCardsProps = {
  summary: SecurityAuditSummary;
};

type SummaryCardItem = {
  id: string;
  label: string;
  value: number;
  description: string;
};

export function SecurityAuditSummaryCards({
  summary,
}: SecurityAuditSummaryCardsProps) {
  const cards: SummaryCardItem[] = [
    {
      id: "eventos-24h",
      label: "Eventos últimas 24 h",
      value: summary.eventosUltimas24h,
      description: "Acciones registradas recientemente en el sistema.",
    },
    {
      id: "acciones-criticas",
      label: "Acciones críticas",
      value: summary.accionesCriticas,
      description: "Cambios sensibles que requieren seguimiento.",
    },
    {
      id: "errores-activos",
      label: "Errores 500 activos",
      value: summary.incidentes500Activos,
      description: "Incidentes pendientes de resolución técnica.",
    },
    {
      id: "errores-resueltos",
      label: "Errores 500 resueltos",
      value: summary.incidentes500Resueltos,
      description: "Incidentes cerrados por el equipo técnico.",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.id} className="nutri-platform-stat px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            {card.label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-nutri-primary">
            {formatInteger(card.value)}
          </p>
          <p className="mt-1 text-xs text-nutri-dark-grey/80">{card.description}</p>
        </article>
      ))}
    </section>
  );
}
