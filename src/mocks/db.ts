// src/mocks/db.ts
import { uid } from "./utils";

import type {
  User,
  Clinician,
  Patient,
  PatientTutor,
  Patientclinician,
  Consultation,
  AnthropometricData,
  ClinicalData,
  Antecedent,
} from "@/types";

type Store = {
  users: User[];
  clinicians: Clinician[];
  patients: Patient[];
  patientTutor: PatientTutor[];
  patientclinician: Patientclinician[];
  consultations: Consultation[];
  anthropometricData: AnthropometricData[];
  clinicalData: ClinicalData[];
  antecedents: Antecedent[];

  passwords: Map<string, string>;
};

const G = globalThis as any;

function initDb(): Store {
  if (!G.__NUTRISEM_DB__) {
    G.__NUTRISEM_DB__ = {
      users: [],
      clinicians: [],
      patients: [],
      patientTutor: [],
      patientclinician: [],
      consultations: [],
      anthropometricData: [],
      clinicalData: [],
      antecedents: [],
      passwords: new Map(),
    } satisfies Store;
  }
  return G.__NUTRISEM_DB__;
}

export const db = initDb();

export function getUserById(id: string) {
  return db.users.find((u) => u.userId === id) ?? null;
}

export function getUserByCI(ci: string) {
  return db.users.find((u) => u.identityCard === ci) ?? null;
}

export function hardResetDb() {
  db.users.length = 0;
  db.clinicians.length = 0;
  db.patients.length = 0;
  db.patientTutor.length = 0;
  db.patientclinician.length = 0;
  db.consultations.length = 0;
  db.anthropometricData.length = 0;
  db.clinicalData.length = 0;
  db.antecedents.length = 0;
  db.passwords.clear();
  G.__NUTRISEM_MOCKS_SEEDED__ = false;
}

export function seedOnce() {
  if (G.__NUTRISEM_MOCKS_SEEDED__) return;
  G.__NUTRISEM_MOCKS_SEEDED__ = true;

  const userAdmin: User = {
    userId: uid("usr"),
    role: "admin",
    firstName: "Admin",
    lastName: "System",
    identityCard: "0000",
    phone: "000000",
    address: "Main Office",
    password: "admin",
  };

  const userClinician: User = {
    userId: uid("usr"),
    role: "clinician",
    firstName: "Juan",
    lastName: "Mendez",
    identityCard: "1234567",
    phone: "7777777",
    address: "La Paz",
    password: "clinician",
  };

  const userPatient: User = {
    userId: uid("usr"),
    role: "patient",
    firstName: "Maria",
    lastName: "Flores",
    identityCard: "9988776",
    phone: "68000000",
    address: "El Alto",
    password: "patient",
  };

  db.users.push(userAdmin, userClinician, userPatient);

  // passwords centralizadas
  db.passwords.set(userAdmin.userId, "admin");
  db.passwords.set(userClinician.userId, "clinician");
  db.passwords.set(userPatient.userId, "patient");

  const clinician1: Clinician = {
    clinicianId: uid("mon"),
    userId: userClinician.userId,
    professionalId: "MP-001",
    profession: "Nutritionist",
    specialty: "Pediatrics",
    residence: "La Paz",
    institution: "Children's Hospital",
  };

  db.clinicians.push(clinician1);

  // Relación 1:1 -> asociar clinician dentro de user
  userClinician.clinician = clinician1;

  const patient1: Patient = {
    patientId: uid("pat"),
    userId: userPatient.userId,
    birthDate: "2018-05-12",
    gender: "female",
    tutors: [],
  };

  db.patients.push(patient1);

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

  db.patientclinician.push({
    patientclinicianId: uid("pm"),
    patientId: patient1.patientId,
    clinicianId: clinician1.clinicianId,
  });

  const consultation1: Consultation = {
    consultationId: uid("con"),
    patientId: patient1.patientId,
    clinicianId: clinician1.clinicianId,
    date: "2025-01-15",
    time: "09:00",
  };

  db.consultations.push(consultation1);

  db.anthropometricData.push({
    anthropometricDataId: uid("ad"),
    consultationId: consultation1.consultationId,
    weight: 14.2,
    height: 98,
    muac: 13.5,
    headCircumference: 49,
  });

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
