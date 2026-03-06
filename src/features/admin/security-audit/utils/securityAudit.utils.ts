import { UserRole, type Consultation } from "@/types";
import type {
  AuditEventType,
  AuditLogEntry,
  AuditLogFilters,
  AuditRiskLevel,
  ErrorIncidentSeverity,
  ErrorIncidentStatus,
  SecurityAuditDashboardData,
  SecurityAuditDataInput,
  SecurityAuditSummary,
  ServerErrorFilters,
  ServerErrorIncident,
} from "../types";

const ONE_MINUTE_MS = 60_000;
const ONE_DAY_MS = 24 * 60 * ONE_MINUTE_MS;

type EventContext = {
  usersById: Map<string, SecurityAuditDataInput["users"][number]>;
  cliniciansById: Map<string, SecurityAuditDataInput["clinicians"][number]>;
  patientsById: Map<string, SecurityAuditDataInput["patients"][number]>;
  consultationsById: Map<string, SecurityAuditDataInput["consultations"][number]>;
  diagnosesById: Map<string, SecurityAuditDataInput["diagnoses"][number]>;
};

type DefaultServerErrorTemplate = Omit<
  ServerErrorIncident,
  "firstSeenAt" | "lastSeenAt"
> & {
  firstSeenMinutesAgo: number;
  lastSeenMinutesAgo: number;
};

const DEFAULT_SERVER_ERROR_TEMPLATES: DefaultServerErrorTemplate[] = [
  {
    id: "ERR-500-1024",
    endpoint: "POST /api/diagnosticos",
    moduleName: "Motor de diagnóstico",
    message: "Timeout al persistir cambios antropométricos del diagnóstico.",
    affectedFlow: "Edición de diagnóstico clínico",
    occurrences: 4,
    severity: "alta",
    status: "en-seguimiento",
    firstSeenMinutesAgo: 390,
    lastSeenMinutesAgo: 35,
  },
  {
    id: "ERR-500-1031",
    endpoint: "GET /api/recomendaciones",
    moduleName: "Servicio de recomendaciones",
    message: "Error inesperado al cargar recomendaciones para consulta pediátrica.",
    affectedFlow: "Vista de recomendaciones del médico",
    occurrences: 3,
    severity: "media",
    status: "nuevo",
    firstSeenMinutesAgo: 220,
    lastSeenMinutesAgo: 70,
  },
  {
    id: "ERR-500-1042",
    endpoint: "POST /api/reportes",
    moduleName: "Generador de reportes",
    message: "Falla al renderizar documento PDF por consumo de memoria.",
    affectedFlow: "Generación de reporte clínico",
    occurrences: 2,
    severity: "media",
    status: "en-seguimiento",
    firstSeenMinutesAgo: 145,
    lastSeenMinutesAgo: 18,
  },
  {
    id: "ERR-500-1050",
    endpoint: "PUT /api/configuracion-medica",
    moduleName: "Parámetros del sistema",
    message: "No se pudo validar el esquema de percentiles OMS.",
    affectedFlow: "Actualización de configuración médica",
    occurrences: 1,
    severity: "baja",
    status: "resuelto",
    firstSeenMinutesAgo: 980,
    lastSeenMinutesAgo: 830,
  },
];

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function subtractMinutes(referenceDate: Date, minutes: number): Date {
  return new Date(referenceDate.getTime() - minutes * ONE_MINUTE_MS);
}

function addMinutes(referenceDate: Date, minutes: number): Date {
  return new Date(referenceDate.getTime() + minutes * ONE_MINUTE_MS);
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function buildEventContext(input: SecurityAuditDataInput): EventContext {
  return {
    usersById: new Map(input.users.map((user) => [user.userId, user] as const)),
    cliniciansById: new Map(
      input.clinicians.map((clinician) => [clinician.clinicianId, clinician] as const)
    ),
    patientsById: new Map(input.patients.map((patient) => [patient.patientId, patient] as const)),
    consultationsById: new Map(
      input.consultations.map((consultation) => [consultation.consultationId, consultation] as const)
    ),
    diagnosesById: new Map(input.diagnoses.map((diagnosis) => [diagnosis.diagnosisId, diagnosis] as const)),
  };
}

function combineConsultationDateTime(consultation: Consultation): Date | null {
  if (!isValidDate(consultation.date)) return null;

  const [rawHour, rawMinute, rawSecond] = consultation.time.split(":");
  const parsedHour = Number.parseInt(rawHour ?? "", 10);
  const parsedMinute = Number.parseInt(rawMinute ?? "", 10);
  const parsedSecond = Number.parseInt(rawSecond ?? "", 10);

  const hour = Number.isFinite(parsedHour) && parsedHour >= 0 && parsedHour <= 23 ? parsedHour : 0;
  const minute =
    Number.isFinite(parsedMinute) && parsedMinute >= 0 && parsedMinute <= 59 ? parsedMinute : 0;
  const second =
    Number.isFinite(parsedSecond) && parsedSecond >= 0 && parsedSecond <= 59 ? parsedSecond : 0;

  return new Date(
    consultation.date.getFullYear(),
    consultation.date.getMonth(),
    consultation.date.getDate(),
    hour,
    minute,
    second,
    0
  );
}

function resolvePatientName(
  context: EventContext,
  patientId: string | undefined
): string {
  if (!patientId) return "Paciente no identificado";
  const patient = context.patientsById.get(patientId);
  if (!patient) return "Paciente no identificado";
  return `${patient.firstName} ${patient.lastName}`;
}

function resolveClinicianName(
  context: EventContext,
  clinicianId: string | undefined
): string {
  if (!clinicianId) return "Médico no identificado";
  const clinician = context.cliniciansById.get(clinicianId);
  if (!clinician) return "Médico no identificado";
  const user = context.usersById.get(clinician.userId);
  if (!user) return "Médico no identificado";
  return `Dr. ${user.firstName} ${user.lastName}`;
}

function resolveUserName(context: EventContext, userId: string | undefined): string {
  if (!userId) return "Usuario no identificado";
  const user = context.usersById.get(userId);
  if (!user) return "Usuario no identificado";
  return `${user.firstName} ${user.lastName}`;
}

function resolveUserRole(context: EventContext, userId: string | undefined): UserRole | "system" {
  if (!userId) return "system";
  return context.usersById.get(userId)?.role ?? "system";
}

function createAuditEntry({
  id,
  actorName,
  actorRole,
  action,
  target,
  summary,
  eventType,
  riskLevel,
  occurredAt,
}: AuditLogEntry): AuditLogEntry {
  return {
    id,
    actorName,
    actorRole,
    action,
    target,
    summary,
    eventType,
    riskLevel,
    occurredAt,
  };
}

function buildConsultationAuditEntries(
  input: SecurityAuditDataInput,
  context: EventContext
): AuditLogEntry[] {
  return input.consultations
    .map((consultation) => {
      const occurredAt = combineConsultationDateTime(consultation);
      if (!occurredAt) return null;

      const actorName = resolveClinicianName(context, consultation.clinicianId);
      const patientName = resolvePatientName(context, consultation.patientId);

      return createAuditEntry({
        id: `audit-consultation-${consultation.consultationId}`,
        actorName,
        actorRole: UserRole.clinician,
        action: "Registró consulta",
        target: patientName,
        summary: `${actorName} registró una consulta para ${patientName}.`,
        eventType: "consulta",
        riskLevel: "medio",
        occurredAt,
      });
    })
    .filter((entry): entry is AuditLogEntry => entry !== null);
}

function buildDiagnosisAuditEntries(
  input: SecurityAuditDataInput,
  context: EventContext
): AuditLogEntry[] {
  return input.diagnoses
    .map((diagnosis) => {
      const consultation = context.consultationsById.get(diagnosis.consultationId);
      if (!consultation) return null;

      const consultationDateTime = combineConsultationDateTime(consultation);
      if (!consultationDateTime) return null;

      const occurredAt = addMinutes(consultationDateTime, 20);
      const actorName = resolveClinicianName(context, consultation.clinicianId);
      const patientName = resolvePatientName(context, consultation.patientId);

      return createAuditEntry({
        id: `audit-diagnosis-${diagnosis.diagnosisId}`,
        actorName,
        actorRole: UserRole.clinician,
        action: "Modificó diagnóstico",
        target: patientName,
        summary: `${actorName} modificó el diagnóstico de ${patientName}.`,
        eventType: "diagnostico",
        riskLevel: "alto",
        occurredAt,
      });
    })
    .filter((entry): entry is AuditLogEntry => entry !== null);
}

function buildRecommendationAuditEntries(
  input: SecurityAuditDataInput,
  context: EventContext
): AuditLogEntry[] {
  const diagnosisById = context.diagnosesById;

  return input.recommendations
    .map((recommendation) => {
      const diagnosis = diagnosisById.get(recommendation.diagnosisId);
      if (!diagnosis) return null;

      const consultation = context.consultationsById.get(diagnosis.consultationId);
      if (!consultation) return null;

      const consultationDateTime = combineConsultationDateTime(consultation);
      if (!consultationDateTime) return null;

      const occurredAt = addMinutes(consultationDateTime, 35);
      const actorName = resolveClinicianName(context, consultation.clinicianId);
      const patientName = resolvePatientName(context, consultation.patientId);

      return createAuditEntry({
        id: `audit-recommendation-${recommendation.recommendationId}`,
        actorName,
        actorRole: UserRole.clinician,
        action: "Actualizó recomendaciones",
        target: patientName,
        summary: `${actorName} actualizó recomendaciones nutricionales de ${patientName}.`,
        eventType: "recomendacion",
        riskLevel: "medio",
        occurredAt,
      });
    })
    .filter((entry): entry is AuditLogEntry => entry !== null);
}

function buildReportAuditEntries(
  input: SecurityAuditDataInput,
  context: EventContext
): AuditLogEntry[] {
  return input.reports
    .map((report) => {
      if (!isValidDate(report.generationDate)) return null;

      const actorName = resolveUserName(context, report.userId);
      const actorRole = resolveUserRole(context, report.userId);

      return createAuditEntry({
        id: `audit-report-${report.reportId}`,
        actorName,
        actorRole,
        action: "Generó reporte",
        target: report.reportType,
        summary: `${actorName} generó el reporte "${report.reportType}" en formato ${report.format}.`,
        eventType: "reporte",
        riskLevel: "bajo",
        occurredAt: report.generationDate,
      });
    })
    .filter((entry): entry is AuditLogEntry => entry !== null);
}

function buildSystemAuditEntries(referenceDate: Date): AuditLogEntry[] {
  return [
    createAuditEntry({
      id: "audit-config-system",
      actorName: "Sistema de seguridad",
      actorRole: "system",
      action: "Actualizó políticas",
      target: "Política de sesión y bloqueo",
      summary:
        "Sistema de seguridad actualizó reglas de sesión para fortalecer controles de acceso.",
      eventType: "configuracion",
      riskLevel: "alto",
      occurredAt: subtractMinutes(referenceDate, 80),
    }),
  ];
}

export function buildAuditLogEntries(
  input: SecurityAuditDataInput,
  referenceDate: Date = input.now ?? new Date()
): AuditLogEntry[] {
  const context = buildEventContext(input);
  const entries = [
    ...buildConsultationAuditEntries(input, context),
    ...buildDiagnosisAuditEntries(input, context),
    ...buildRecommendationAuditEntries(input, context),
    ...buildReportAuditEntries(input, context),
    ...buildSystemAuditEntries(referenceDate),
  ];

  return entries.sort((first, second) => second.occurredAt.getTime() - first.occurredAt.getTime());
}

function buildMissingDiagnosisIncidents(
  input: SecurityAuditDataInput,
  context: EventContext
): ServerErrorIncident[] {
  const diagnosisConsultationIds = new Set(
    input.diagnoses.map((diagnosis) => diagnosis.consultationId)
  );

  return input.consultations
    .filter((consultation) => !diagnosisConsultationIds.has(consultation.consultationId))
    .map((consultation) => {
      const consultationDateTime = combineConsultationDateTime(consultation) ?? new Date();
      const patientName = resolvePatientName(context, consultation.patientId);

      return {
        id: `ERR-500-DIA-${consultation.consultationId}`,
        endpoint: "POST /api/diagnosticos",
        moduleName: "Motor de diagnóstico",
        message: `No se pudo persistir el diagnóstico inicial de ${patientName}.`,
        affectedFlow: "Cierre de consulta médica",
        firstSeenAt: addMinutes(consultationDateTime, 10),
        lastSeenAt: addMinutes(consultationDateTime, 12),
        occurrences: 1,
        severity: "alta",
        status: "nuevo",
      } satisfies ServerErrorIncident;
    });
}

function buildMissingRecommendationIncidents(
  input: SecurityAuditDataInput,
  context: EventContext
): ServerErrorIncident[] {
  const recommendationDiagnosisIds = new Set(
    input.recommendations.map((recommendation) => recommendation.diagnosisId)
  );

  return input.diagnoses
    .filter((diagnosis) => !recommendationDiagnosisIds.has(diagnosis.diagnosisId))
    .map((diagnosis) => {
      const consultation = context.consultationsById.get(diagnosis.consultationId);
      const consultationDateTime = consultation
        ? combineConsultationDateTime(consultation)
        : null;
      const patientName = consultation
        ? resolvePatientName(context, consultation.patientId)
        : "paciente no identificado";

      const baseDate = consultationDateTime ?? new Date();

      return {
        id: `ERR-500-REC-${diagnosis.diagnosisId}`,
        endpoint: "POST /api/recomendaciones",
        moduleName: "Servicio de recomendaciones",
        message: `Error al generar recomendaciones para ${patientName}.`,
        affectedFlow: "Plan nutricional posterior al diagnóstico",
        firstSeenAt: addMinutes(baseDate, 18),
        lastSeenAt: addMinutes(baseDate, 23),
        occurrences: 2,
        severity: "media",
        status: "en-seguimiento",
      } satisfies ServerErrorIncident;
    });
}

function buildOrphanRecommendationFoodIncidents(
  input: SecurityAuditDataInput,
  referenceDate: Date
): ServerErrorIncident[] {
  const recommendationIds = new Set(
    input.recommendations.map((recommendation) => recommendation.recommendationId)
  );
  const foodIds = new Set(input.foods.map((food) => food.foodId));

  const missingRecommendationCount = input.recommendationFoods.filter(
    (row) => !recommendationIds.has(row.recommendationId)
  ).length;
  const missingFoodCount = input.recommendationFoods.filter(
    (row) => !foodIds.has(row.foodId)
  ).length;

  const incidents: ServerErrorIncident[] = [];

  if (missingRecommendationCount > 0) {
    incidents.push({
      id: "ERR-500-LNK-RECOMMENDATION",
      endpoint: "GET /api/recomendaciones/alimentos",
      moduleName: "Integridad de datos",
      message:
        "Se detectaron referencias a recomendaciones inexistentes en la relación recomendación-alimentos.",
      affectedFlow: "Carga de alimentos sugeridos",
      firstSeenAt: subtractMinutes(referenceDate, 120),
      lastSeenAt: subtractMinutes(referenceDate, 45),
      occurrences: missingRecommendationCount,
      severity: "alta",
      status: "en-seguimiento",
    });
  }

  if (missingFoodCount > 0) {
    incidents.push({
      id: "ERR-500-LNK-FOOD",
      endpoint: "GET /api/alimentos",
      moduleName: "Integridad de catálogo",
      message:
        "Se detectaron alimentos referenciados que no existen en el catálogo activo.",
      affectedFlow: "Generación de recomendaciones para paciente",
      firstSeenAt: subtractMinutes(referenceDate, 160),
      lastSeenAt: subtractMinutes(referenceDate, 30),
      occurrences: missingFoodCount,
      severity: "media",
      status: "nuevo",
    });
  }

  return incidents;
}

function buildFallbackServerErrors(referenceDate: Date): ServerErrorIncident[] {
  return DEFAULT_SERVER_ERROR_TEMPLATES.map((item) => ({
    id: item.id,
    endpoint: item.endpoint,
    moduleName: item.moduleName,
    message: item.message,
    affectedFlow: item.affectedFlow,
    firstSeenAt: subtractMinutes(referenceDate, item.firstSeenMinutesAgo),
    lastSeenAt: subtractMinutes(referenceDate, item.lastSeenMinutesAgo),
    occurrences: item.occurrences,
    severity: item.severity,
    status: item.status,
  }));
}

export function buildRecentServerErrorIncidents(
  input: SecurityAuditDataInput,
  referenceDate: Date = input.now ?? new Date()
): ServerErrorIncident[] {
  const context = buildEventContext(input);

  const dataDrivenIncidents = [
    ...buildMissingDiagnosisIncidents(input, context),
    ...buildMissingRecommendationIncidents(input, context),
    ...buildOrphanRecommendationFoodIncidents(input, referenceDate),
  ];

  const fallbackIncidents = buildFallbackServerErrors(referenceDate);

  const result =
    dataDrivenIncidents.length >= 4
      ? dataDrivenIncidents
      : [...dataDrivenIncidents, ...fallbackIncidents.slice(0, 4 - dataDrivenIncidents.length)];

  return result
    .sort((first, second) => second.lastSeenAt.getTime() - first.lastSeenAt.getTime())
    .slice(0, 12);
}

export function buildSecurityAuditSummary(
  auditLogEntries: AuditLogEntry[],
  serverErrors: ServerErrorIncident[],
  referenceDate: Date = new Date()
): SecurityAuditSummary {
  const cutoffTime = referenceDate.getTime() - ONE_DAY_MS;

  return {
    eventosUltimas24h: auditLogEntries.filter(
      (entry) => entry.occurredAt.getTime() >= cutoffTime
    ).length,
    accionesCriticas: auditLogEntries.filter((entry) => entry.riskLevel === "alto").length,
    incidentes500Activos: serverErrors.filter((incident) => incident.status !== "resuelto")
      .length,
    incidentes500Resueltos: serverErrors.filter((incident) => incident.status === "resuelto")
      .length,
  };
}

export function createSecurityAuditDashboardData(
  input: SecurityAuditDataInput
): SecurityAuditDashboardData {
  const now = input.now ?? new Date();
  const auditLogEntries = buildAuditLogEntries(input, now);
  const serverErrors = buildRecentServerErrorIncidents(input, now);
  const summary = buildSecurityAuditSummary(auditLogEntries, serverErrors, now);

  return {
    auditLogEntries,
    serverErrors,
    summary,
    generatedAt: now,
  };
}

export function filterAuditLogEntries(
  entries: AuditLogEntry[],
  filters: AuditLogFilters
): AuditLogEntry[] {
  const normalizedSearch = normalizeSearchText(filters.search);

  return entries.filter((entry) => {
    const matchesEventType =
      filters.eventType === "all" || entry.eventType === filters.eventType;

    if (!matchesEventType) return false;
    if (!normalizedSearch) return true;

    const searchableContent = normalizeSearchText(
      `${entry.actorName} ${entry.action} ${entry.target} ${entry.summary}`
    );
    return searchableContent.includes(normalizedSearch);
  });
}

export function filterServerErrorIncidents(
  incidents: ServerErrorIncident[],
  filters: ServerErrorFilters
): ServerErrorIncident[] {
  const normalizedSearch = normalizeSearchText(filters.search);

  return incidents.filter((incident) => {
    const matchesStatus = filters.status === "all" || incident.status === filters.status;
    if (!matchesStatus) return false;
    if (!normalizedSearch) return true;

    const searchableContent = normalizeSearchText(
      `${incident.id} ${incident.endpoint} ${incident.moduleName} ${incident.message} ${incident.affectedFlow}`
    );
    return searchableContent.includes(normalizedSearch);
  });
}

export function formatInteger(value: number): string {
  return new Intl.NumberFormat("es-BO").format(value);
}

export function formatDateTimeLabel(value: Date): string {
  if (!isValidDate(value)) return "Sin fecha";
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function formatRelativeTimeLabel(
  value: Date,
  referenceDate: Date = new Date()
): string {
  if (!isValidDate(value)) return "Sin referencia";

  const diffMinutes = Math.max(0, Math.round((referenceDate.getTime() - value.getTime()) / ONE_MINUTE_MS));

  if (diffMinutes < 1) return "Hace unos segundos";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;

  const diffDays = Math.round(diffHours / 24);
  return `Hace ${diffDays} día${diffDays === 1 ? "" : "s"}`;
}

export function getAuditEventTypeLabel(eventType: AuditEventType): string {
  switch (eventType) {
    case "autenticacion":
      return "Autenticación";
    case "consulta":
      return "Consulta";
    case "diagnostico":
      return "Diagnóstico";
    case "recomendacion":
      return "Recomendación";
    case "reporte":
      return "Reporte";
    case "configuracion":
      return "Configuración";
    default:
      return "Evento";
  }
}

export function getAuditRiskLevelLabel(level: AuditRiskLevel): string {
  if (level === "alto") return "Riesgo alto";
  if (level === "medio") return "Riesgo medio";
  return "Riesgo bajo";
}

export function getErrorSeverityLabel(level: ErrorIncidentSeverity): string {
  if (level === "alta") return "Alta";
  if (level === "media") return "Media";
  return "Baja";
}

export function getErrorStatusLabel(status: ErrorIncidentStatus): string {
  if (status === "nuevo") return "Nuevo";
  if (status === "en-seguimiento") return "En seguimiento";
  return "Resuelto";
}
