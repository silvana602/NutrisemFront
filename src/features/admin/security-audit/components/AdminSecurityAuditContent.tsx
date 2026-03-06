"use client";

import { useMemo, useState } from "react";
import { Heading } from "@/components/atoms/Heading";
import { db, seedOnce } from "@/mocks/db";
import type {
  AuditLogEventFilter,
  ErrorIncidentStatus,
  ErrorIncidentStatusFilter,
} from "../types";
import {
  buildSecurityAuditSummary,
  createSecurityAuditDashboardData,
  filterAuditLogEntries,
  filterServerErrorIncidents,
  formatDateTimeLabel,
} from "../utils";
import { AuditLogSection } from "./AuditLogSection";
import { SecurityAuditSummaryCards } from "./SecurityAuditSummaryCards";
import { ServerErrorsSection } from "./ServerErrorsSection";

seedOnce();

export default function AdminSecurityAuditContent() {
  const dashboardData = useMemo(
    () =>
      createSecurityAuditDashboardData({
        users: db.users,
        clinicians: db.clinicians,
        patients: db.patients,
        consultations: db.consultations,
        diagnoses: db.diagnoses,
        recommendations: db.recommendations,
        recommendationFoods: db.recommendationFoods,
        foods: db.foods,
        reports: db.reports,
      }),
    []
  );

  const [auditSearch, setAuditSearch] = useState("");
  const [auditEventType, setAuditEventType] =
    useState<AuditLogEventFilter>("all");
  const [errorSearch, setErrorSearch] = useState("");
  const [errorStatusFilter, setErrorStatusFilter] =
    useState<ErrorIncidentStatusFilter>("all");
  const [statusOverridesByIncidentId, setStatusOverridesByIncidentId] =
    useState<Record<string, ErrorIncidentStatus>>({});

  const serverErrorsWithOverrides = useMemo(
    () =>
      dashboardData.serverErrors.map((incident) => ({
        ...incident,
        status: statusOverridesByIncidentId[incident.id] ?? incident.status,
      })),
    [dashboardData.serverErrors, statusOverridesByIncidentId]
  );

  const filteredAuditEntries = useMemo(
    () =>
      filterAuditLogEntries(dashboardData.auditLogEntries, {
        search: auditSearch,
        eventType: auditEventType,
      }),
    [dashboardData.auditLogEntries, auditSearch, auditEventType]
  );

  const filteredServerErrors = useMemo(
    () =>
      filterServerErrorIncidents(serverErrorsWithOverrides, {
        search: errorSearch,
        status: errorStatusFilter,
      }),
    [serverErrorsWithOverrides, errorSearch, errorStatusFilter]
  );

  const summary = useMemo(
    () =>
      buildSecurityAuditSummary(
        dashboardData.auditLogEntries,
        serverErrorsWithOverrides,
        dashboardData.generatedAt
      ),
    [
      dashboardData.auditLogEntries,
      dashboardData.generatedAt,
      serverErrorsWithOverrides,
    ]
  );

  const handleToggleIncidentStatus = (incidentId: string) => {
    setStatusOverridesByIncidentId((current) => {
      const sourceIncident = dashboardData.serverErrors.find(
        (incident) => incident.id === incidentId
      );
      const currentStatus =
        current[incidentId] ?? sourceIncident?.status ?? "nuevo";

      const nextStatus: ErrorIncidentStatus =
        currentStatus === "resuelto" ? "en-seguimiento" : "resuelto";

      return {
        ...current,
        [incidentId]: nextStatus,
      };
    });
  };

  return (
    <div className="nutri-platform-page px-1 py-1 sm:px-2">
      <div className="nutri-platform-page-header p-4 sm:p-5">
        <Heading
          containerClassName="space-y-2"
          description="Crucial para cumplir normativas de salud: supervisa trazabilidad de acciones y controla errores 500 antes de impactar la atención médica."
        >
          Seguridad y auditoría
        </Heading>
      </div>

      <div className="nutri-platform-surface-soft flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <p className="text-sm text-nutri-dark-grey/85">
          Seguridad y logs clínicos para monitoreo operativo y cumplimiento regulatorio.
        </p>
        <p className="text-xs font-medium text-nutri-dark-grey/75">
          Última actualización: {formatDateTimeLabel(dashboardData.generatedAt)}
        </p>
      </div>

      <SecurityAuditSummaryCards summary={summary} />

      <AuditLogSection
        entries={filteredAuditEntries}
        search={auditSearch}
        eventType={auditEventType}
        onSearchChange={setAuditSearch}
        onEventTypeChange={setAuditEventType}
      />

      <ServerErrorsSection
        incidents={filteredServerErrors}
        search={errorSearch}
        status={errorStatusFilter}
        onSearchChange={setErrorSearch}
        onStatusChange={setErrorStatusFilter}
        onToggleIncidentStatus={handleToggleIncidentStatus}
      />
    </div>
  );
}
