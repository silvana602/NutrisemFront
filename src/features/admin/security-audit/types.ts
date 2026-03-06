import type {
  Clinician,
  Consultation,
  Diagnosis,
  Patient,
  Recommendation,
  RecommendationFood,
  Report,
  User,
  UserRole,
  Food,
} from "@/types";

export type AuditEventType =
  | "autenticacion"
  | "consulta"
  | "diagnostico"
  | "recomendacion"
  | "reporte"
  | "configuracion";

export type AuditRiskLevel = "bajo" | "medio" | "alto";

export type AuditActorRole = UserRole | "system";

export type AuditLogEntry = {
  id: string;
  actorName: string;
  actorRole: AuditActorRole;
  action: string;
  target: string;
  summary: string;
  eventType: AuditEventType;
  riskLevel: AuditRiskLevel;
  occurredAt: Date;
};

export type ErrorIncidentSeverity = "alta" | "media" | "baja";

export type ErrorIncidentStatus = "nuevo" | "en-seguimiento" | "resuelto";

export type ServerErrorIncident = {
  id: string;
  endpoint: string;
  moduleName: string;
  message: string;
  affectedFlow: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  occurrences: number;
  severity: ErrorIncidentSeverity;
  status: ErrorIncidentStatus;
};

export type AuditLogEventFilter = "all" | AuditEventType;

export type ErrorIncidentStatusFilter = "all" | ErrorIncidentStatus;

export type AuditLogFilters = {
  search: string;
  eventType: AuditLogEventFilter;
};

export type ServerErrorFilters = {
  search: string;
  status: ErrorIncidentStatusFilter;
};

export type SecurityAuditSummary = {
  eventosUltimas24h: number;
  accionesCriticas: number;
  incidentes500Activos: number;
  incidentes500Resueltos: number;
};

export type SecurityAuditDashboardData = {
  auditLogEntries: AuditLogEntry[];
  serverErrors: ServerErrorIncident[];
  summary: SecurityAuditSummary;
  generatedAt: Date;
};

export type SecurityAuditDataInput = {
  users: User[];
  clinicians: Clinician[];
  patients: Patient[];
  consultations: Consultation[];
  diagnoses: Diagnosis[];
  recommendations: Recommendation[];
  recommendationFoods: RecommendationFood[];
  foods: Food[];
  reports: Report[];
  now?: Date;
};
