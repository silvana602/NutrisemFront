import { describe, expect, it } from "vitest";
import { UserRole, type Consultation, type Patient, type User } from "@/types";
import {
  buildHourlyActivitySeries,
  calculatePatientRetentionRate,
  calculateTodayConsultations,
  calculateTotalActiveUsers,
  createAdminDashboardData,
} from "@/features/admin/dashboard/utils";

const sampleUsers: User[] = [
  {
    userId: "usr_1",
    firstName: "Ana",
    lastName: "Rojas",
    identityNumber: "111",
    phone: "70000001",
    address: "La Paz",
    role: UserRole.admin,
    password: "demo",
  },
  {
    userId: "usr_2",
    firstName: "Luis",
    lastName: "Mendoza",
    identityNumber: "222",
    phone: "70000002",
    address: "El Alto",
    role: UserRole.clinician,
    password: "demo",
  },
];

const samplePatients: Patient[] = [
  {
    patientId: "pat_1",
    userId: "usr_10",
    firstName: "María",
    lastName: "Flores",
    identityNumber: "333",
    birthDate: new Date("2021-01-01"),
    gender: "female",
    address: "La Paz",
  },
  {
    patientId: "pat_2",
    userId: "usr_11",
    firstName: "Juan",
    lastName: "Quispe",
    identityNumber: "444",
    birthDate: new Date("2020-03-02"),
    gender: "male",
    address: "Cochabamba",
  },
];

const sampleConsultations: Consultation[] = [
  {
    consultationId: "con_1",
    patientId: "pat_1",
    clinicianId: "cli_1",
    date: new Date("2026-03-04T09:10:00"),
    time: "09:10:00",
  },
  {
    consultationId: "con_2",
    patientId: "pat_1",
    clinicianId: "cli_1",
    date: new Date("2026-03-04T09:45:00"),
    time: "09:45:00",
  },
  {
    consultationId: "con_3",
    patientId: "pat_2",
    clinicianId: "cli_1",
    date: new Date("2026-03-03T14:15:00"),
    time: "14:15:00",
  },
];

describe("admin dashboard utils", () => {
  it("calcula total de usuarios activos", () => {
    expect(calculateTotalActiveUsers(sampleUsers)).toBe(2);
  });

  it("calcula consultas registradas hoy", () => {
    const today = new Date("2026-03-04T18:00:00");
    expect(calculateTodayConsultations(sampleConsultations, today)).toBe(2);
  });

  it("calcula la tasa de retención de pacientes", () => {
    const retention = calculatePatientRetentionRate(samplePatients, sampleConsultations);
    expect(retention.retainedPatients).toBe(1);
    expect(retention.totalPatients).toBe(2);
    expect(retention.rate).toBe(0.5);
  });

  it("construye serie de actividad por hora", () => {
    const series = buildHourlyActivitySeries(sampleConsultations);
    expect(series).toHaveLength(24);
    expect(series[9].value).toBe(2);
    expect(series[14].value).toBe(1);
    expect(series[23].label).toBe("23:00");
  });

  it("construye datos agregados del panel de administración", () => {
    const data = createAdminDashboardData({
      users: sampleUsers,
      patients: samplePatients,
      consultations: sampleConsultations,
      apiOperational: true,
      databaseOperational: true,
      now: new Date("2026-03-04T18:00:00"),
    });

    expect(data.kpis).toHaveLength(3);
    expect(data.peakActivityLabel).toContain("09:00");
    expect(data.serviceStatuses[0].operativo).toBe(true);
    expect(data.serviceStatuses[1].operativo).toBe(true);
  });
});
