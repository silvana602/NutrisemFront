import { SectionTitle } from "@/components/atoms/SectionTitle";
import type { AdminServiceStatus } from "../types";
import { ServiceStatusCard } from "./ServiceStatusCard";

type AdminServiceStatusSectionProps = {
  statuses: AdminServiceStatus[];
  updatedAt: Date;
};

export function AdminServiceStatusSection({
  statuses,
  updatedAt,
}: AdminServiceStatusSectionProps) {
  const updatedAtLabel = new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(updatedAt);

  return (
    <section className="nutri-platform-surface p-4 sm:p-5">
      <SectionTitle className="mt-0">Estado de los servicios</SectionTitle>
      <p className="mt-2 text-sm text-nutri-dark-grey/85">
        Monitoreo rápido de disponibilidad de API y Base de datos.
      </p>

      <div className="mt-4 space-y-3">
        {statuses.map((status) => (
          <ServiceStatusCard key={status.id} status={status} />
        ))}
      </div>

      <p className="mt-3 text-xs text-nutri-dark-grey/75">
        Última actualización: {updatedAtLabel}
      </p>
    </section>
  );
}
