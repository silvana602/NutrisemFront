import { describe, expect, it } from "vitest";
import { UserRole, type Clinician, type Consultation, type Patient, type User } from "@/types";
import type { AdminPatientsDataset } from "@/features/admin/user-management/types";
import {
  buildDoctorManagementRows,
  buildDoctorPerformanceSummary,
  buildPatientDirectoryRows,
  createAdminPatientsDataset,
  filterPatientDirectoryRows,
  findDuplicatePatientGroups,
  mergeDuplicatePatients,
} from "@/features/admin/user-management/utils";

const users: User[] = [
  {
    userId: "usr_doc_1",
    firstName: "Ana",
    lastName: "Mendoza",
    identityNumber: "12345",
    phone: "70000001",
    address: "La Paz",
    role: UserRole.clinician,
    password: "demo",
  },
  {
    userId: "usr_doc_2",
    firstName: "Luis",
    lastName: "Quispe",
    identityNumber: "54321",
    phone: "70000002",
    address: "Cochabamba",
    role: UserRole.clinician,
    password: "demo",
  },
  {
    userId: "usr_pat_1",
    firstName: "María",
    lastName: "Flores",
    identityNumber: "999001",
    phone: "70000003",
    address: "La Paz",
    role: UserRole.patient,
    password: "demo",
  },
  {
    userId: "usr_pat_2",
    firstName: "María",
    lastName: "Flores",
    identityNumber: "999001",
    phone: "70000004",
    address: "El Alto",
    role: UserRole.patient,
    password: "demo",
  },
];

const clinicians: Clinician[] = [
  {
    clinicianId: "cli_1",
    userId: "usr_doc_1",
    professionalLicense: "COL-001",
    profession: "Nutrición",
    specialty: "Pediatría",
    residence: "La Paz",
    institution: "Hospital A",
  },
  {
    clinicianId: "cli_2",
    userId: "usr_doc_2",
    professionalLicense: "COL-002",
    profession: "Nutrición",
    specialty: "Clínica",
    residence: "Cochabamba",
    institution: "Hospital B",
  },
];

const patients: Patient[] = [
  {
    patientId: "pat_1",
    userId: "usr_pat_1",
    firstName: "María",
    lastName: "Flores",
    identityNumber: "999001",
    birthDate: new Date("2022-01-01"),
    gender: "female",
    address: "La Paz",
  },
  {
    patientId: "pat_2",
    userId: "usr_pat_2",
    firstName: "María",
    lastName: "Flores",
    identityNumber: "999001",
    birthDate: new Date("2022-01-01"),
    gender: "female",
    address: "El Alto",
  },
];

const consultations: Consultation[] = [
  {
    consultationId: "con_1",
    patientId: "pat_1",
    clinicianId: "cli_1",
    date: new Date("2026-03-04T09:00:00"),
    time: "09:00:00",
  },
  {
    consultationId: "con_2",
    patientId: "pat_2",
    clinicianId: "cli_1",
    date: new Date("2026-03-04T09:40:00"),
    time: "09:40:00",
  },
];

const patientsDataset: AdminPatientsDataset = createAdminPatientsDataset({
  users,
  patients,
  consultations,
  guardians: [],
  histories: [],
  patientClinicians: [],
  patientProgress: [],
});

describe("admin user management utils", () => {
  it("construye filas de médicos con métricas de desempeño", () => {
    const rows = buildDoctorManagementRows({
      clinicians,
      users,
      consultations,
    });

    expect(rows).toHaveLength(2);
    expect(rows[0].consultasRealizadas).toBe(2);
    expect(rows[0].pacientesAtendidos).toBe(2);
  });

  it("calcula resumen de desempeño de médicos", () => {
    const rows = buildDoctorManagementRows({
      clinicians,
      users,
      consultations,
    });
    const summary = buildDoctorPerformanceSummary(rows);

    expect(summary.totalMedicos).toBe(2);
    expect(summary.totalConsultas).toBe(2);
  });

  it("filtra directorio de pacientes por C.I., nombre y rango", () => {
    const rows = buildPatientDirectoryRows(patientsDataset);
    const filteredRows = filterPatientDirectoryRows(rows, {
      ci: "999001",
      nombre: "María",
      rangoEdad: "0-5",
    });

    expect(filteredRows).toHaveLength(2);
  });

  it("detecta grupos duplicados y fusiona registros", () => {
    const rows = buildPatientDirectoryRows(patientsDataset);
    const duplicates = findDuplicatePatientGroups(rows);
    expect(duplicates.length).toBeGreaterThan(0);

    const mergeResult = mergeDuplicatePatients(patientsDataset, duplicates[0]);
    expect(mergeResult.mergedPatientIds.length).toBe(1);
    expect(mergeResult.dataset.patients).toHaveLength(1);
  });
});
