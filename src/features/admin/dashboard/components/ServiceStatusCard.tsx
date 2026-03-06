import { cn } from "@/lib/utils";
import type { AdminServiceStatus } from "../types";

type ServiceStatusCardProps = {
  status: AdminServiceStatus;
};

export function ServiceStatusCard({ status }: ServiceStatusCardProps) {
  return (
    <article
      className={cn(
        "nutri-service-status-card rounded-xl border px-4 py-3",
        status.operativo
          ? "nutri-service-status-card-up border-emerald-200 bg-emerald-50/70"
          : "nutri-service-status-card-down border-red-200 bg-red-50/70"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="nutri-service-status-title text-sm font-semibold text-nutri-dark-grey">
          {status.nombre}
        </p>
        <span
          className={cn(
            "nutri-service-status-pill inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            status.operativo
              ? "nutri-service-status-pill-up bg-emerald-100 text-emerald-700"
              : "nutri-service-status-pill-down bg-red-100 text-red-700"
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              status.operativo ? "bg-emerald-500" : "bg-red-500"
            )}
          />
          {status.operativo ? "Operativo" : "Con incidencias"}
        </span>
      </div>

      <p className="nutri-service-status-description mt-2 text-sm text-nutri-dark-grey/80">
        {status.descripcion}
      </p>
    </article>
  );
}
