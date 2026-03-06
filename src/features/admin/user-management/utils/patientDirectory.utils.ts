import { calculateAge } from "@/lib/utils";
import { calculateAgeInMonths, formatPediatricAge } from "@/lib/pediatricAge";
import type {
  AdminPatientsDataset,
  DuplicatePatientGroup,
  MergeDuplicateResult,
  PatientAgeRangeFilter,
  PatientDirectoryRow,
  PatientSearchFilters,
} from "../types";

type DbLikePatientsSource = {
  users: AdminPatientsDataset["users"];
  patients: AdminPatientsDataset["patients"];
  consultations: AdminPatientsDataset["consultations"];
  guardians: AdminPatientsDataset["guardians"];
  histories: AdminPatientsDataset["histories"];
  patientClinicians: AdminPatientsDataset["patientClinicians"];
  patientProgress: AdminPatientsDataset["patientProgress"];
};

export const PATIENT_AGE_RANGE_OPTIONS: Array<{
  value: PatientAgeRangeFilter;
  label: string;
}> = [
  { value: "all", label: "Todos los rangos" },
  { value: "0-5", label: "0 a 5 años" },
  { value: "6-12", label: "6 a 12 años" },
  { value: "13-17", label: "13 a 17 años" },
  { value: "18-plus", label: "18 años o más" },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizeIdentity(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9]/g, "");
}

function toSafeDate(value: Date): Date | null {
  if (!(value instanceof Date)) return null;
  if (Number.isNaN(value.getTime())) return null;
  return value;
}

function resolveAgeRange(ageYears: number): PatientAgeRangeFilter {
  if (ageYears <= 5) return "0-5";
  if (ageYears <= 12) return "6-12";
  if (ageYears <= 17) return "13-17";
  return "18-plus";
}

function resolveAgeRangeLabel(ageRange: PatientAgeRangeFilter): string {
  if (ageRange === "0-5") return "0 a 5 años";
  if (ageRange === "6-12") return "6 a 12 años";
  if (ageRange === "13-17") return "13 a 17 años";
  if (ageRange === "18-plus") return "18 años o más";
  return "Todos";
}

function formatAgeLabel(birthDate: Date): string {
  const months = calculateAgeInMonths(birthDate);
  if (months <= 60) return formatPediatricAge(months);

  const years = calculateAge(birthDate);
  return `${years} ${years === 1 ? "año" : "años"}`;
}

function formatConsultationDate(value: Date | null): string {
  if (!value) return "Sin consultas";
  return value.toLocaleDateString("es-BO");
}

function buildDirectoryRow(
  patient: AdminPatientsDataset["patients"][number],
  dataset: AdminPatientsDataset
): PatientDirectoryRow {
  const user = dataset.users.find((item) => item.userId === patient.userId) ?? null;
  const consultations = dataset.consultations
    .filter((item) => item.patientId === patient.patientId)
    .sort((first, second) => second.date.getTime() - first.date.getTime());

  const lastConsultationDate = toSafeDate(consultations[0]?.date ?? null);
  const ageYears = calculateAge(patient.birthDate);
  const ageRange = resolveAgeRange(ageYears);

  return {
    patientId: patient.patientId,
    nombreCompleto: `${patient.firstName} ${patient.lastName}`,
    ci: user?.identityNumber ?? patient.identityNumber ?? "Sin C.I.",
    edadAnios: ageYears,
    edadEtiqueta: formatAgeLabel(patient.birthDate),
    rangoEdad: ageRange,
    rangoEdadEtiqueta: resolveAgeRangeLabel(ageRange),
    cantidadConsultas: consultations.length,
    ultimaConsultaEtiqueta: formatConsultationDate(lastConsultationDate),
    fechaNacimiento: patient.birthDate,
  };
}

function getMembersKey(patientIds: string[]): string {
  return [...patientIds].sort().join("-");
}

function getGroupId(membersKey: string, reason: string): string {
  return `${reason}:${membersKey}`;
}

function selectPrimaryPatient(rows: PatientDirectoryRow[]): PatientDirectoryRow {
  return [...rows].sort((first, second) => {
    if (first.cantidadConsultas !== second.cantidadConsultas) {
      return second.cantidadConsultas - first.cantidadConsultas;
    }
    return first.nombreCompleto.localeCompare(second.nombreCompleto, "es");
  })[0];
}

export function createAdminPatientsDataset(source: DbLikePatientsSource): AdminPatientsDataset {
  return {
    users: source.users.map((user) => ({ ...user })),
    patients: source.patients.map((patient) => ({
      ...patient,
      birthDate: new Date(patient.birthDate),
    })),
    consultations: source.consultations.map((consultation) => ({
      ...consultation,
      date: new Date(consultation.date),
    })),
    guardians: source.guardians.map((guardian) => ({ ...guardian })),
    histories: source.histories.map((history) => ({
      ...history,
      creationDate: new Date(history.creationDate),
    })),
    patientClinicians: source.patientClinicians.map((relation) => ({ ...relation })),
    patientProgress: source.patientProgress.map((progress) => ({
      ...progress,
      date: new Date(progress.date),
    })),
  };
}

export function buildPatientDirectoryRows(
  dataset: AdminPatientsDataset
): PatientDirectoryRow[] {
  return dataset.patients
    .map((patient) => buildDirectoryRow(patient, dataset))
    .sort((first, second) => {
      if (first.cantidadConsultas !== second.cantidadConsultas) {
        return second.cantidadConsultas - first.cantidadConsultas;
      }
      return first.nombreCompleto.localeCompare(second.nombreCompleto, "es");
    });
}

export function filterPatientDirectoryRows(
  rows: PatientDirectoryRow[],
  filters: PatientSearchFilters
): PatientDirectoryRow[] {
  const normalizedNameQuery = normalizeText(filters.nombre);
  const normalizedCiQuery = normalizeIdentity(filters.ci);

  return rows.filter((row) => {
    if (normalizedNameQuery && !normalizeText(row.nombreCompleto).includes(normalizedNameQuery)) {
      return false;
    }

    if (normalizedCiQuery && !normalizeIdentity(row.ci).includes(normalizedCiQuery)) {
      return false;
    }

    if (filters.rangoEdad !== "all" && row.rangoEdad !== filters.rangoEdad) {
      return false;
    }

    return true;
  });
}

export function findDuplicatePatientGroups(
  rows: PatientDirectoryRow[]
): DuplicatePatientGroup[] {
  const groupsById = new Map<string, DuplicatePatientGroup>();

  const byCi = rows.reduce<Map<string, PatientDirectoryRow[]>>((acc, row) => {
    const key = normalizeIdentity(row.ci);
    if (!key) return acc;
    const current = acc.get(key) ?? [];
    current.push(row);
    acc.set(key, current);
    return acc;
  }, new Map<string, PatientDirectoryRow[]>());

  byCi.forEach((members) => {
    if (members.length < 2) return;
    const principal = selectPrimaryPatient(members);
    const membersKey = getMembersKey(members.map((member) => member.patientId));
    groupsById.set(membersKey, {
      groupId: getGroupId(membersKey, "ci"),
      motivo: "Coincidencia de Cédula de Identidad",
      principalId: principal.patientId,
      miembros: members.sort((first, second) =>
        first.nombreCompleto.localeCompare(second.nombreCompleto, "es")
      ),
    });
  });

  const byNameAndBirth = rows.reduce<Map<string, PatientDirectoryRow[]>>((acc, row) => {
    const birthDate = toSafeDate(row.fechaNacimiento);
    if (!birthDate) return acc;

    const key = `${normalizeText(row.nombreCompleto)}|${birthDate.toISOString().slice(0, 10)}`;
    const current = acc.get(key) ?? [];
    current.push(row);
    acc.set(key, current);
    return acc;
  }, new Map<string, PatientDirectoryRow[]>());

  byNameAndBirth.forEach((members) => {
    if (members.length < 2) return;
    const principal = selectPrimaryPatient(members);
    const membersKey = getMembersKey(members.map((member) => member.patientId));
    if (groupsById.has(membersKey)) return;

    groupsById.set(membersKey, {
      groupId: getGroupId(membersKey, "nombre-fecha"),
      motivo: "Coincidencia de nombre y fecha de nacimiento",
      principalId: principal.patientId,
      miembros: members.sort((first, second) =>
        first.nombreCompleto.localeCompare(second.nombreCompleto, "es")
      ),
    });
  });

  return [...groupsById.values()].sort((first, second) => {
    if (first.miembros.length !== second.miembros.length) {
      return second.miembros.length - first.miembros.length;
    }
    return first.motivo.localeCompare(second.motivo, "es");
  });
}

function remapPatientId(currentId: string, idsToMerge: Set<string>, principalId: string): string {
  if (idsToMerge.has(currentId)) return principalId;
  return currentId;
}

function deduplicatePatientClinicians(
  relations: AdminPatientsDataset["patientClinicians"]
): AdminPatientsDataset["patientClinicians"] {
  const seenKeys = new Set<string>();
  return relations.filter((relation) => {
    const key = `${relation.patientId}-${relation.clinicianId}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });
}

export function mergeDuplicatePatients(
  dataset: AdminPatientsDataset,
  group: DuplicatePatientGroup
): MergeDuplicateResult {
  const idsToMerge = new Set(
    group.miembros
      .map((member) => member.patientId)
      .filter((patientId) => patientId !== group.principalId)
  );

  const mergedPatientIds = [...idsToMerge];
  if (mergedPatientIds.length === 0) {
    return {
      dataset,
      principalId: group.principalId,
      mergedPatientIds: [],
    };
  }

  const nextDataset: AdminPatientsDataset = {
    ...dataset,
    patients: dataset.patients.filter((patient) => !idsToMerge.has(patient.patientId)),
    consultations: dataset.consultations.map((consultation) => ({
      ...consultation,
      patientId: remapPatientId(consultation.patientId, idsToMerge, group.principalId),
    })),
    guardians: dataset.guardians.map((guardian) => ({
      ...guardian,
      patientId: remapPatientId(guardian.patientId, idsToMerge, group.principalId),
    })),
    histories: dataset.histories.map((history) => ({
      ...history,
      patientId: remapPatientId(history.patientId, idsToMerge, group.principalId),
    })),
    patientClinicians: deduplicatePatientClinicians(
      dataset.patientClinicians.map((relation) => ({
        ...relation,
        patientId: remapPatientId(relation.patientId, idsToMerge, group.principalId),
      }))
    ),
    patientProgress: dataset.patientProgress.map((progress) => ({
      ...progress,
      patientId: remapPatientId(progress.patientId, idsToMerge, group.principalId),
    })),
  };

  return {
    dataset: nextDataset,
    principalId: group.principalId,
    mergedPatientIds,
  };
}
