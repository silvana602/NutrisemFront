import { Search } from "lucide-react";
import { TextInput } from "@/components/atoms/TextInput";
import type { AuditLogEntry, AuditLogEventFilter } from "../types";
import {
  formatDateTimeLabel,
  formatRelativeTimeLabel,
  getAuditEventTypeLabel,
  getAuditRiskLevelLabel,
} from "../utils";

type AuditLogSectionProps = {
  entries: AuditLogEntry[];
  search: string;
  eventType: AuditLogEventFilter;
  onSearchChange: (value: string) => void;
  onEventTypeChange: (value: AuditLogEventFilter) => void;
};

function getRiskBadgeClass(riskLevel: AuditLogEntry["riskLevel"]): string {
  if (riskLevel === "alto") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (riskLevel === "medio") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

const EVENT_TYPE_OPTIONS: Array<{ value: AuditLogEventFilter; label: string }> = [
  { value: "all", label: "Todos los eventos" },
  { value: "autenticacion", label: "Autenticación" },
  { value: "consulta", label: "Consultas" },
  { value: "diagnostico", label: "Diagnósticos" },
  { value: "recomendacion", label: "Recomendaciones" },
  { value: "reporte", label: "Reportes" },
  { value: "configuracion", label: "Configuración" },
];

export function AuditLogSection({
  entries,
  search,
  eventType,
  onSearchChange,
  onEventTypeChange,
}: AuditLogSectionProps) {
  return (
    <section className="nutri-platform-surface p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-nutri-primary">Registro de actividad (Audit Log)</h2>
        <p className="mt-1 text-sm text-nutri-dark-grey/85">
          Seguimiento de quién hizo qué y cuándo para trazabilidad clínica y administrativa.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_250px]">
        <TextInput
          placeholder="Buscar por actor, acción o paciente"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          icon={<Search size={16} />}
        />
        <select
          value={eventType}
          onChange={(event) =>
            onEventTypeChange(event.target.value as AuditLogEventFilter)
          }
          className="nutri-input w-full"
          aria-label="Filtrar por tipo de evento"
        >
          {EVENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-xl border border-nutri-light-grey/80 bg-white/80 px-4 py-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-nutri-primary/20 bg-nutri-off-white px-2.5 py-0.5 text-xs font-semibold text-nutri-primary">
                {getAuditEventTypeLabel(entry.eventType)}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getRiskBadgeClass(
                  entry.riskLevel
                )}`}
              >
                {getAuditRiskLevelLabel(entry.riskLevel)}
              </span>
              <span className="text-xs text-nutri-dark-grey/70">
                {formatRelativeTimeLabel(entry.occurredAt)}
              </span>
            </div>

            <p className="mt-2 text-sm font-semibold text-nutri-dark-grey">{entry.summary}</p>

            <p className="mt-1 text-xs text-nutri-dark-grey/75">
              Actor: {entry.actorName} · Acción: {entry.action} · Objetivo: {entry.target}
            </p>
            <p className="mt-1 text-xs text-nutri-dark-grey/70">
              Fecha y hora: {formatDateTimeLabel(entry.occurredAt)}
            </p>
          </article>
        ))}

        {entries.length === 0 && (
          <div className="rounded-xl border border-dashed border-nutri-light-grey bg-nutri-off-white/50 px-4 py-6 text-center text-sm text-nutri-dark-grey/80">
            No se encontraron eventos con los filtros aplicados.
          </div>
        )}
      </div>
    </section>
  );
}
