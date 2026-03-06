import type { Consultation, Patient, User } from "@/types";
import type { AdminDashboardData, HourlyActivityPoint } from "../types";

type AdminDashboardDataInput = {
  users: User[];
  patients: Patient[];
  consultations: Consultation[];
  apiOperational: boolean;
  databaseOperational: boolean;
  now?: Date;
};

const HOURS_PER_DAY = 24;

function toValidDate(value: Date): Date | null {
  if (!(value instanceof Date)) return null;
  if (Number.isNaN(value.getTime())) return null;
  return value;
}

function normalizeDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function isSameDay(firstDate: Date, secondDate: Date): boolean {
  const firstNormalized = normalizeDay(firstDate).getTime();
  const secondNormalized = normalizeDay(secondDate).getTime();
  return firstNormalized === secondNormalized;
}

function extractConsultationHour(consultation: Consultation): number | null {
  const timeMatch = consultation.time.match(/^(\d{1,2})/);
  if (timeMatch) {
    const parsedHour = Number.parseInt(timeMatch[1], 10);
    if (parsedHour >= 0 && parsedHour < HOURS_PER_DAY) return parsedHour;
  }

  const fallbackDate = toValidDate(consultation.date);
  if (!fallbackDate) return null;
  return fallbackDate.getHours();
}

function formatHourLabel(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat("es-BO").format(value);
}

function formatPercentage(value: number): string {
  return new Intl.NumberFormat("es-BO", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function calculateTotalActiveUsers(users: User[]): number {
  const userIds = new Set(users.map((user) => user.userId).filter(Boolean));
  return userIds.size;
}

export function calculateTodayConsultations(
  consultations: Consultation[],
  referenceDate: Date
): number {
  return consultations.reduce((count, consultation) => {
    const consultationDate = toValidDate(consultation.date);
    if (!consultationDate) return count;
    return isSameDay(consultationDate, referenceDate) ? count + 1 : count;
  }, 0);
}

export function calculatePatientRetentionRate(
  patients: Patient[],
  consultations: Consultation[]
): { rate: number; retainedPatients: number; totalPatients: number } {
  if (patients.length === 0) {
    return {
      rate: 0,
      retainedPatients: 0,
      totalPatients: 0,
    };
  }

  const consultationCounterByPatient = consultations.reduce<Map<string, number>>((acc, item) => {
    const previousCount = acc.get(item.patientId) ?? 0;
    acc.set(item.patientId, previousCount + 1);
    return acc;
  }, new Map<string, number>());

  const retainedPatients = patients.reduce((count, patient) => {
    const consultationCount = consultationCounterByPatient.get(patient.patientId) ?? 0;
    return consultationCount >= 2 ? count + 1 : count;
  }, 0);

  const rate = retainedPatients / patients.length;

  return {
    rate,
    retainedPatients,
    totalPatients: patients.length,
  };
}

export function buildHourlyActivitySeries(consultations: Consultation[]): HourlyActivityPoint[] {
  const activityByHour = Array.from({ length: HOURS_PER_DAY }, (_, hour) => ({
    hour,
    label: formatHourLabel(hour),
    value: 0,
  }));

  consultations.forEach((consultation) => {
    const hour = extractConsultationHour(consultation);
    if (hour === null) return;
    activityByHour[hour].value += 1;
  });

  return activityByHour;
}

export function getPeakActivityHour(
  hourlyActivity: HourlyActivityPoint[]
): HourlyActivityPoint | null {
  if (hourlyActivity.length === 0) return null;

  const peak = hourlyActivity.reduce<HourlyActivityPoint | null>((currentPeak, point) => {
    if (!currentPeak) return point;
    if (point.value > currentPeak.value) return point;
    return currentPeak;
  }, null);

  if (!peak || peak.value === 0) return null;
  return peak;
}

export function isDatabaseOperational(database: {
  users?: unknown;
  patients?: unknown;
  consultations?: unknown;
}): boolean {
  return (
    Array.isArray(database.users) &&
    Array.isArray(database.patients) &&
    Array.isArray(database.consultations)
  );
}

export function createAdminDashboardData({
  users,
  patients,
  consultations,
  apiOperational,
  databaseOperational,
  now = new Date(),
}: AdminDashboardDataInput): AdminDashboardData {
  const totalActiveUsers = calculateTotalActiveUsers(users);
  const consultationsToday = calculateTodayConsultations(consultations, now);
  const retention = calculatePatientRetentionRate(patients, consultations);
  const hourlyActivity = buildHourlyActivitySeries(consultations);
  const peakActivity = getPeakActivityHour(hourlyActivity);

  return {
    kpis: [
      {
        id: "usuarios-activos",
        etiqueta: "Total de usuarios activos",
        valor: formatInteger(totalActiveUsers),
        descripcion: `${formatInteger(totalActiveUsers)} usuarios con acceso activo al sistema.`,
      },
      {
        id: "consultas-hoy",
        etiqueta: "Nuevas consultas realizadas hoy",
        valor: formatInteger(consultationsToday),
        descripcion: "Consultas registradas durante la jornada actual.",
      },
      {
        id: "retencion-pacientes",
        etiqueta: "Tasa de retención de pacientes",
        valor: formatPercentage(retention.rate),
        descripcion: `${formatInteger(retention.retainedPatients)} de ${formatInteger(
          retention.totalPatients
        )} pacientes con dos o más consultas.`,
      },
    ],
    hourlyActivity,
    peakActivityLabel: peakActivity
      ? `${peakActivity.label} (${formatInteger(peakActivity.value)} sesiones)`
      : "Sin actividad registrada en el periodo",
    serviceStatuses: [
      {
        id: "api",
        nombre: "API",
        operativo: apiOperational,
        descripcion: apiOperational
          ? "La API responde correctamente."
          : "La API presenta incidencias de disponibilidad.",
      },
      {
        id: "base-datos",
        nombre: "Base de datos",
        operativo: databaseOperational,
        descripcion: databaseOperational
          ? "La base de datos está operativa."
          : "La base de datos presenta incidencias de conexión.",
      },
    ],
    updatedAt: now,
  };
}
