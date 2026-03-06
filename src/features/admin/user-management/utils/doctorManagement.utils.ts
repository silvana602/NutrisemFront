import type { Clinician, Consultation, User } from "@/types";
import type {
  DoctorAccessStatus,
  DoctorManagementRow,
  DoctorPerformanceSummary,
} from "../types";

type BuildDoctorRowsInput = {
  clinicians: Clinician[];
  users: User[];
  consultations: Consultation[];
  accessStatusByClinicianId?: Record<string, DoctorAccessStatus>;
};

const DEFAULT_CONSULTATION_DURATION_MINUTES = 35;
const MIN_VALID_DURATION_MINUTES = 10;
const MAX_VALID_DURATION_MINUTES = 120;

function resolveDoctorName(user: User | undefined): string {
  if (!user) return "Sin usuario asociado";
  return `${user.firstName} ${user.lastName}`;
}

function combineConsultationDateAndTime(consultation: Consultation): Date | null {
  if (!(consultation.date instanceof Date) || Number.isNaN(consultation.date.getTime())) {
    return null;
  }

  const [rawHour, rawMinute] = consultation.time.split(":");
  const hour = Number.parseInt(rawHour ?? "", 10);
  const minute = Number.parseInt(rawMinute ?? "", 10);
  const safeHour = Number.isFinite(hour) && hour >= 0 && hour <= 23 ? hour : 0;
  const safeMinute = Number.isFinite(minute) && minute >= 0 && minute <= 59 ? minute : 0;

  return new Date(
    consultation.date.getFullYear(),
    consultation.date.getMonth(),
    consultation.date.getDate(),
    safeHour,
    safeMinute,
    0,
    0
  );
}

function estimateAverageMinutesPerConsultation(
  consultations: Consultation[]
): number | null {
  if (consultations.length === 0) return null;

  const sortedConsultations = [...consultations]
    .map((consultation) => ({
      consultation,
      dateTime: combineConsultationDateAndTime(consultation),
    }))
    .filter((item): item is { consultation: Consultation; dateTime: Date } => item.dateTime !== null)
    .sort((first, second) => first.dateTime.getTime() - second.dateTime.getTime());

  if (sortedConsultations.length === 0) return null;

  const totalEstimatedMinutes = sortedConsultations.reduce((total, item, index) => {
    const next = sortedConsultations[index + 1];
    if (!next) return total + DEFAULT_CONSULTATION_DURATION_MINUTES;

    const minutesDelta = Math.round(
      (next.dateTime.getTime() - item.dateTime.getTime()) / (1000 * 60)
    );

    if (
      Number.isFinite(minutesDelta) &&
      minutesDelta >= MIN_VALID_DURATION_MINUTES &&
      minutesDelta <= MAX_VALID_DURATION_MINUTES
    ) {
      return total + minutesDelta;
    }

    return total + DEFAULT_CONSULTATION_DURATION_MINUTES;
  }, 0);

  return Number((totalEstimatedMinutes / sortedConsultations.length).toFixed(1));
}

export function normalizeIdentity(value: string): string {
  return value.trim().toLowerCase();
}

export function buildDoctorManagementRows({
  clinicians,
  users,
  consultations,
  accessStatusByClinicianId = {},
}: BuildDoctorRowsInput): DoctorManagementRow[] {
  const usersById = new Map(users.map((user) => [user.userId, user] as const));

  const rows = clinicians.map((clinician) => {
    const clinicianUser = usersById.get(clinician.userId);
    const doctorConsultations = consultations.filter(
      (consultation) => consultation.clinicianId === clinician.clinicianId
    );
    const uniquePatientsCount = new Set(
      doctorConsultations.map((consultation) => consultation.patientId)
    ).size;

    return {
      clinicianId: clinician.clinicianId,
      nombreCompleto: resolveDoctorName(clinicianUser),
      especialidad: clinician.specialty || "Sin especialidad registrada",
      numeroColegiatura: clinician.professionalLicense || "Sin colegiatura",
      estadoAcceso:
        accessStatusByClinicianId[clinician.clinicianId] ??
        (doctorConsultations.length > 0 ? "activo" : "inactivo"),
      consultasRealizadas: doctorConsultations.length,
      promedioMinutosPorPaciente: estimateAverageMinutesPerConsultation(
        doctorConsultations
      ),
      pacientesAtendidos: uniquePatientsCount,
    } satisfies DoctorManagementRow;
  });

  return rows.sort((first, second) => {
    if (first.estadoAcceso !== second.estadoAcceso) {
      return first.estadoAcceso === "activo" ? -1 : 1;
    }
    return first.nombreCompleto.localeCompare(second.nombreCompleto, "es");
  });
}

export function buildInitialDoctorAccessStatus(
  rows: DoctorManagementRow[]
): Record<string, DoctorAccessStatus> {
  return rows.reduce<Record<string, DoctorAccessStatus>>((acc, row) => {
    acc[row.clinicianId] = row.estadoAcceso;
    return acc;
  }, {});
}

export function buildDoctorPerformanceSummary(
  rows: DoctorManagementRow[]
): DoctorPerformanceSummary {
  const totalConsultas = rows.reduce(
    (total, row) => total + row.consultasRealizadas,
    0
  );

  const promediosDisponibles = rows
    .map((row) => row.promedioMinutosPorPaciente)
    .filter((value): value is number => typeof value === "number");

  const promedioGlobalMinutos =
    promediosDisponibles.length > 0
      ? Number(
          (
            promediosDisponibles.reduce((total, value) => total + value, 0) /
            promediosDisponibles.length
          ).toFixed(1)
        )
      : null;

  return {
    totalMedicos: rows.length,
    medicosActivos: rows.filter((row) => row.estadoAcceso === "activo").length,
    medicosInactivos: rows.filter((row) => row.estadoAcceso === "inactivo").length,
    totalConsultas,
    promedioGlobalMinutos,
  };
}

export function formatMinutesLabel(minutes: number | null): string {
  if (minutes === null) return "Sin datos";
  return `${minutes.toFixed(1)} min`;
}
