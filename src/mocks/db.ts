// src/mocks/db.ts
import { uid } from "./utils";

import type {
  User,
  Healthcare,
  Patient,
  PatientTutor,
  PatientHealthcare,
  Consultation,
  AnthropometricData,
  ClinicalData,
  Antecedent,
} from "@/types";

//
// ---------------------------------------------------------------------
//   IN-MEMORY STORE (actualizado: sin roles ni profiles)
// ---------------------------------------------------------------------
//

type Store = {
  users: User[]; // ahora contiene datos personales (antes profile) + role
  Healthcares: Healthcare[]; // referencia a userId
  patients: Patient[]; // referencia a userId
  patientTutor: PatientTutor[]; // relaciones paciente <-> tutor
  patientHealthcare: PatientHealthcare[]; // relaciones paciente <-> Healthcare
  consultations: Consultation[];
  anthropometricData: AnthropometricData[];
  clinicalData: ClinicalData[];
  antecedents: Antecedent[];

  passwords: Map<string, string>; // almacena contraseñas por userId o tutorId
};

const G = globalThis as any;

function initDb(): Store {
  if (!G.__NUTRISEM_DB__) {
    G.__NUTRISEM_DB__ = {
      users: [],
      Healthcares: [],
      patients: [],
      patientTutor: [],
      patientHealthcare: [],
      consultations: [],
      anthropometricData: [],
      clinicalData: [],
      antecedents: [],
      passwords: new Map<string, string>(),
    } satisfies Store;
  }
  return G.__NUTRISEM_DB__;
}

export const db = initDb();

//
// ---------------------------------------------------------------------
//   UTILITIES (actualizados)
// ---------------------------------------------------------------------
//

export function getUserById(id: string) {
  return db.users.find((u) => u.userId === id) ?? null;
}

/**
 * Busca usuario por número de documento (CI).
 * Ahora los datos de identidad están dentro de db.users.
 */
export function getUserByCI(ci: string) {
  return db.users.find((u) => u.identityCard === ci) ?? null;
}

export function getPatientById(id: string) {
  return db.patients.find((p) => p.patientId === id) ?? null;
}

export function hardResetDb() {
  initDb();
  db.users.length = 0;
  db.Healthcares.length = 0;
  db.patients.length = 0;
  db.patientTutor.length = 0;
  db.patientHealthcare.length = 0;
  db.consultations.length = 0;
  db.anthropometricData.length = 0;
  db.clinicalData.length = 0;
  db.antecedents.length = 0;
  db.passwords.clear();
  G.__NUTRISEM_MOCKS_SEEDED__ = false;
}

//
// ---------------------------------------------------------------------
//   SEED (actualizado a la nueva estructura)
// ---------------------------------------------------------------------
//

export function seedOnce() {
  if (G.__NUTRISEM_MOCKS_SEEDED__) return;
  G.__NUTRISEM_MOCKS_SEEDED__ = true;

  //
  // ---- USERS (admin, Healthcare, patient) ----
  //
  const userAdmin: User = {
    userId: uid("usr"),
    role: "admin", // ahora role es atributo directo
    password: "admin", // mantenemos el campo por compatibilidad con tipos previos
    firstName: "Admin",
    lastName: "System",
    identityCard: "0000",
    phone: "000000",
    address: "Main Office",
  };

  const userHealthcare: User = {
    userId: uid("usr"),
    role: "healthcare",
    password: "123456",
    firstName: "Juan",
    lastName: "Mendez",
    identityCard: "1234567",
    phone: "7777777",
    address: "La Paz",
  };

  const userPatient: User = {
    userId: uid("usr"),
    role: "patient", // paciente también es un usuario
    password: "patient", // si no quieres password para pacientes, quítalo
    firstName: "Maria",
    lastName: "Flores",
    identityCard: "9988776",
    phone: "68000000",
    address: "El Alto",
  };

  db.users.push(userAdmin, userHealthcare, userPatient);

  // Guardar contraseñas en el mapa (simulación)
  db.passwords.set(userAdmin.userId, userAdmin.password ?? "");
  db.passwords.set(userHealthcare.userId, userHealthcare.password ?? "");
  db.passwords.set(userPatient.userId, userPatient.password ?? "");

  //
  // ---- Healthcare (referencia a userId) ----
  //
  const Healthcare1: Healthcare = {
    healthcareId: uid("mon"),
    userId: userHealthcare.userId, // ahora vinculado por userId
    professionalId: "MP-001",
    profession: "Nutritionist",
    specialty: "Pediatrics",
    residence: "La Paz",
    institution: "Children's Hospital",
  };

  db.Healthcares.push(Healthcare1);

  //
  // ---- PATIENT (referencia a userId) ----
  //
  const patient1: Patient = {
    patientId: uid("pat"),
    userId: userPatient!.userId, // ! asegura que TypeScript sepa que no es undefined
    birthDate: "2018-05-12",
    gender: "female",
    tutors: [], // inicialmente vacío, luego puedes agregar tutores
  };

  db.patients.push(patient1);

  //
  // ---- TUTORES DEL PACIENTE ----
  //
  const tutor1: PatientTutor = {
    patientTutorId: uid("pt"),
    patientId: patient1.patientId,
    firstName: "Rita",
    lastName: "Meneses",
    identityCard: "5554443",
    phone: "69000000",
    address: "El Alto",
    relation: "madre",
  };

  patient1.tutors.push(tutor1);

  //
  // ---- RELACIÓN PACIENTE - Healthcare ----
  //
  db.patientHealthcare.push({
    patientHealthcareId: uid("pm"),
    patientId: patient1.patientId,
    healthcareId: Healthcare1.healthcareId,
  });

  //
  // ---- CONSULTATION ----
  //
  const consultation1: Consultation = {
    consultationId: uid("con"),
    patientId: patient1.patientId,
    healthcareId: Healthcare1.healthcareId,
    date: "2025-01-15",
    time: "09:00",
  };

  db.consultations.push(consultation1);

  //
  // ---- ANTHROPOMETRIC DATA ----
  //
  db.anthropometricData.push({
    anthropometricDataId: uid("ad"),
    consultationId: consultation1.consultationId,
    weight: 14.2,
    height: 98,
    muac: 13.5,
    headCircumference: 49,
  });

  //
  // ---- CLINICAL DATA ----
  //
  db.clinicalData.push({
    clinicalDataId: uid("cd"),
    consultationId: consultation1.consultationId,
    activity: "Normal",
    mood: "Good",
    hair: "Normal",
    skin: "Healthy",
    edema: "No",
    dentition: "Complete",
    diarrhea: "No",
    vomit: "No",
    dehydration: "No",
    temperature: "36.5°C",
    heartRate: "90",
    respiratoryRate: "20",
    bloodPressure: "90/60",
    observations: "No issues found",
  });

  //
  // ---- ANTECEDENT ----
  //
  db.antecedents.push({
    antecedentId: uid("ant"),
    consultationId: consultation1.consultationId,
    breastfeeding: "Exclusive",
    bottles: "No",
    feedingFrequency: "3 times/day",
    complementaryStart: "6 months",
    foodsConsumed: "Varied solids",
    dailyAmount: "3",
    recentIllnesses: "None",
    vaccination: "Complete",
    averageSleep: "9",
    sleepRoutine: "Regular",
    observations: "Healthy child",
  });
}
