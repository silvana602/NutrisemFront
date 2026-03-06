import { SectionTitle } from "@/components/atoms/SectionTitle";
import type { AdminDashboardKpi } from "../types";

type AdminGlobalKpisSectionProps = {
  kpis: AdminDashboardKpi[];
};

function KpiCard({ etiqueta, valor, descripcion }: AdminDashboardKpi) {
  return (
    <article className="nutri-platform-stat p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-nutri-dark-grey/70">
        {etiqueta}
      </p>
      <p className="mt-2 text-2xl font-bold leading-none text-nutri-primary">{valor}</p>
      <p className="mt-2 text-sm text-nutri-dark-grey/80">{descripcion}</p>
    </article>
  );
}

export function AdminGlobalKpisSection({ kpis }: AdminGlobalKpisSectionProps) {
  return (
    <section className="nutri-platform-surface p-4 sm:p-5">
      <SectionTitle className="mt-0">KPIs globales</SectionTitle>
      <p className="mt-2 text-sm text-nutri-dark-grey/85">
        Seguimiento del desempeño general de usuarios, consultas y continuidad de pacientes.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} {...kpi} />
        ))}
      </div>
    </section>
  );
}
