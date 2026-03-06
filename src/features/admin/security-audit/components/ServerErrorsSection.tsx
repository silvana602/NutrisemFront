import { Search } from "lucide-react";
import { TextInput } from "@/components/atoms/TextInput";
import { Button } from "@/components/ui/Button";
import type {
  ErrorIncidentStatus,
  ErrorIncidentStatusFilter,
  ServerErrorIncident,
} from "../types";
import {
  formatDateTimeLabel,
  formatInteger,
  getErrorSeverityLabel,
  getErrorStatusLabel,
} from "../utils";

type ServerErrorsSectionProps = {
  incidents: ServerErrorIncident[];
  search: string;
  status: ErrorIncidentStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ErrorIncidentStatusFilter) => void;
  onToggleIncidentStatus: (incidentId: string) => void;
};

const STATUS_OPTIONS: Array<{
  value: ErrorIncidentStatusFilter;
  label: string;
}> = [
  { value: "all", label: "Todos los estados" },
  { value: "nuevo", label: "Nuevos" },
  { value: "en-seguimiento", label: "En seguimiento" },
  { value: "resuelto", label: "Resueltos" },
];

function getSeverityBadgeClass(level: ServerErrorIncident["severity"]): string {
  if (level === "alta") return "border-rose-200 bg-rose-50 text-rose-700";
  if (level === "media") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function getStatusBadgeClass(status: ErrorIncidentStatus): string {
  if (status === "nuevo") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "en-seguimiento") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function ServerErrorsSection({
  incidents,
  search,
  status,
  onSearchChange,
  onStatusChange,
  onToggleIncidentStatus,
}: ServerErrorsSectionProps) {
  return (
    <section className="nutri-platform-surface p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-nutri-primary">Gestión de errores 500</h2>
        <p className="mt-1 text-sm text-nutri-dark-grey/85">
          Errores recientes para priorizar correcciones antes de afectar la experiencia del médico.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_250px]">
        <TextInput
          placeholder="Buscar por endpoint, código o módulo"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          icon={<Search size={16} />}
        />
        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as ErrorIncidentStatusFilter)
          }
          className="nutri-input w-full"
          aria-label="Filtrar incidentes por estado"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 hidden overflow-x-auto rounded-xl border border-nutri-light-grey/80 lg:block">
        <table className="min-w-[1180px] w-full bg-white/80 text-sm">
          <thead className="bg-nutri-off-white text-xs uppercase tracking-wide text-nutri-dark-grey/80">
            <tr>
              <th className="px-3 py-3 text-left">Código</th>
              <th className="px-3 py-3 text-left">Endpoint</th>
              <th className="px-3 py-3 text-left">Módulo</th>
              <th className="px-3 py-3 text-left">Mensaje</th>
              <th className="px-3 py-3 text-left">Último evento</th>
              <th className="px-3 py-3 text-left">Ocurrencias</th>
              <th className="px-3 py-3 text-left">Severidad</th>
              <th className="px-3 py-3 text-left">Estado</th>
              <th className="px-3 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id} className="border-t border-nutri-light-grey/70 align-top">
                <td className="px-3 py-3 font-semibold text-nutri-primary">{incident.id}</td>
                <td className="px-3 py-3 text-nutri-dark-grey">{incident.endpoint}</td>
                <td className="px-3 py-3 text-nutri-dark-grey">
                  <p className="font-medium">{incident.moduleName}</p>
                  <p className="mt-1 text-xs text-nutri-dark-grey/70">{incident.affectedFlow}</p>
                </td>
                <td className="px-3 py-3 text-nutri-dark-grey">{incident.message}</td>
                <td className="px-3 py-3 text-nutri-dark-grey">
                  <p>{formatDateTimeLabel(incident.lastSeenAt)}</p>
                  <p className="mt-1 text-xs text-nutri-dark-grey/70">
                    Inicio: {formatDateTimeLabel(incident.firstSeenAt)}
                  </p>
                </td>
                <td className="px-3 py-3 font-semibold text-nutri-dark-grey">
                  {formatInteger(incident.occurrences)}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getSeverityBadgeClass(
                      incident.severity
                    )}`}
                  >
                    {getErrorSeverityLabel(incident.severity)}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                      incident.status
                    )}`}
                  >
                    {getErrorStatusLabel(incident.status)}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <Button
                    variant="outline"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => onToggleIncidentStatus(incident.id)}
                  >
                    {incident.status === "resuelto" ? "Reabrir" : "Marcar resuelto"}
                  </Button>
                </td>
              </tr>
            ))}

            {incidents.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-nutri-dark-grey">
                  No se encontraron errores 500 con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-3 lg:hidden">
        {incidents.map((incident) => (
          <article
            key={incident.id}
            className="rounded-xl border border-nutri-light-grey/80 bg-white/80 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-nutri-primary">{incident.id}</p>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getSeverityBadgeClass(
                    incident.severity
                  )}`}
                >
                  {getErrorSeverityLabel(incident.severity)}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                    incident.status
                  )}`}
                >
                  {getErrorStatusLabel(incident.status)}
                </span>
              </div>
            </div>

            <p className="mt-2 text-sm font-medium text-nutri-dark-grey">{incident.endpoint}</p>
            <p className="mt-1 text-sm text-nutri-dark-grey/85">{incident.message}</p>

            <dl className="mt-3 space-y-1 text-xs text-nutri-dark-grey/80">
              <div className="flex justify-between gap-3">
                <dt>Módulo</dt>
                <dd className="text-right">{incident.moduleName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Flujo afectado</dt>
                <dd className="text-right">{incident.affectedFlow}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Último evento</dt>
                <dd className="text-right">{formatDateTimeLabel(incident.lastSeenAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Ocurrencias</dt>
                <dd className="text-right">{formatInteger(incident.occurrences)}</dd>
              </div>
            </dl>

            <div className="mt-3">
              <Button
                variant="outline"
                className="w-full px-3 py-1.5 text-xs"
                onClick={() => onToggleIncidentStatus(incident.id)}
              >
                {incident.status === "resuelto" ? "Reabrir" : "Marcar resuelto"}
              </Button>
            </div>
          </article>
        ))}

        {incidents.length === 0 && (
          <div className="rounded-xl border border-dashed border-nutri-light-grey bg-nutri-off-white/50 px-4 py-6 text-center text-sm text-nutri-dark-grey/80">
            No se encontraron errores 500 con los filtros aplicados.
          </div>
        )}
      </div>
    </section>
  );
}
