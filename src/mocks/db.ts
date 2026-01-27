// src/mocks/db.ts
import { uid } from "./utils";

import {
  type User,
  type Clinician,
  type Patient,
  type Guardian,
  type PatientClinician,
  type Consultation,
  type AnthropometricData,
  type ClinicalData,
  type Antecedents,
  type History,
  type Diagnosis,
  type Recommendation,
  type Food,
  type RecommendationFood,
  type PatientProgress,
  type Report,
  UserRole,
} from "@/types";

type Store = {
  users: User[];
  clinicians: Clinician[];
  patients: Patient[];
  guardians: Guardian[];
  patientClinicians: PatientClinician[];
  consultations: Consultation[];
  anthropometricData: AnthropometricData[];
  clinicalData: ClinicalData[];
  antecedents: Antecedents[];
  histories: History[];
  diagnoses: Diagnosis[];
  recommendations: Recommendation[];
  foods: Food[];
  recommendationFoods: RecommendationFood[];
  patientProgress: PatientProgress[];
  reports: Report[];
  passwords: Map<string, string>;
};

const G = globalThis as any;

function initDb(): Store {
  if (!G.__NUTRISEM_DB__) {
    G.__NUTRISEM_DB__ = {
      users: [],
      clinicians: [],
      patients: [],
      guardians: [],
      patientClinicians: [],
      consultations: [],
      anthropometricData: [],
      clinicalData: [],
      antecedents: [],
      histories: [],
      diagnoses: [],
      recommendations: [],
      foods: [],
      recommendationFoods: [],
      patientProgress: [],
      reports: [],
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
  return db.users.find((u) => u.identityNumber === ci) ?? null;
}

export function hardResetDb() {
  db.users.length = 0;
  db.clinicians.length = 0;
  db.patients.length = 0;
  db.guardians.length = 0;
  db.patientClinicians.length = 0;
  db.consultations.length = 0;
  db.anthropometricData.length = 0;
  db.clinicalData.length = 0;
  db.antecedents.length = 0;
  db.histories.length = 0;
  db.diagnoses.length = 0;
  db.recommendations.length = 0;
  db.foods.length = 0;
  db.recommendationFoods.length = 0;
  db.patientProgress.length = 0;
  db.reports.length = 0;
  db.passwords.clear();
  G.__NUTRISEM_MOCKS_SEEDED__ = false;
}

export function seedOnce() {
  if (G.__NUTRISEM_MOCKS_SEEDED__) return;
  G.__NUTRISEM_MOCKS_SEEDED__ = true;

  // -------- Users ----------
  const userAdmin: User = {
    userId: uid("usr"),
    role: UserRole.admin,
    firstName: "Admin",
    lastName: "System",
    identityNumber: "0000",
    phone: "000000",
    address: "Main Office",
    password: "admin",
  };

  const userClinician: User = {
    userId: uid("usr"),
    role: UserRole.clinician,
    firstName: "Juan",
    lastName: "Mendez",
    identityNumber: "1234567",
    phone: "7777777",
    address: "La Paz",
    password: "clinician",
  };

  const userPatient: User = {
    userId: uid("usr"),
    role: UserRole.patient,
    firstName: "Maria",
    lastName: "Flores",
    identityNumber: "9988776",
    phone: "68000000",
    address: "El Alto",
    password: "patient",
  };

  const userPatient2: User = {
    userId: uid("usr"),
    role: UserRole.patient,
    firstName: "Juan",
    lastName: "Alcon",
    identityNumber: "6655443",
    phone: "70808090",
    address: "La Paz",
    password: "patient",
  };

  db.users.push(userAdmin, userClinician, userPatient);

  db.passwords.set(userAdmin.userId, "admin");
  db.passwords.set(userClinician.userId, "clinician");
  db.passwords.set(userPatient.userId, "patient");
  db.passwords.set(userPatient2.userId, "patient");

  // -------- Clinician ----------
  const clinician1: Clinician = {
    clinicianId: uid("cli"),
    userId: userClinician.userId,
    professionalLicense: "MP-001",
    profession: "Nutritionist",
    specialty: "Pediatrics",
    residence: "La Paz",
    institution: "Children's Hospital",
  };
  db.clinicians.push(clinician1);

  // -------- Patient ----------
  const patient1: Patient = {
    patientId: uid("pat"),
    userId: userPatient.userId,
    firstName: "Maria",
    lastName: "Flores",
    identityNumber: "9988776",
    birthDate: new Date("2018-05-12"),
    gender: "female",
    address: "El Alto",
  };
  db.patients.push(patient1);

  // -------- Guardian ----------
  const guardian1: Guardian = {
    guardianId: uid("gua"),
    patientId: patient1.patientId,
    firstName: "Rita",
    lastName: "Meneses",
    identityNumber: "5554443",
    phone: "69000000",
    address: "El Alto",
    relationship: "mother",
    password: "guardian123",
  };
  db.guardians.push(guardian1);

  // -------- PatientClinician ----------
  db.patientClinicians.push({
    patientClinicianId: uid("pc"),
    patientId: patient1.patientId,
    clinicianId: clinician1.clinicianId,
  });

  // -------- Consultation ----------
  const consultation1: Consultation = {
    consultationId: uid("con"),
    patientId: patient1.patientId,
    clinicianId: clinician1.clinicianId,
    date: new Date("2025-01-15"),
    time: "09:00:00",
  };
  db.consultations.push(consultation1);

  // -------- AnthropometricData ----------
  db.anthropometricData.push({
    anthropometricDataId: uid("ad"),
    consultationId: consultation1.consultationId,
    weightKg: 14.2,
    heightCm: 98,
    muacCm: 13.5,
    headCircumferenceCm: 49,
  });

  // -------- ClinicalData ----------
  db.clinicalData.push({
    clinicalDataId: uid("cd"),
    consultationId: consultation1.consultationId,
    activityLevel: "Normal",
    apathy: "Good",
    hairCondition: "Normal",
    skinCondition: "Healthy",
    edema: "No",
    dentition: "Complete",
    diarrhea: "No",
    vomiting: "No",
    dehydration: "No",
    temperatureCelsius: 36.5,
    heartRate: 90,
    respiratoryRate: 20,
    bloodPressure: "90/60",
    observations: "No issues found",
  });

  // -------- Antecedents ----------
  db.antecedents.push({
    antecedentsId: uid("fh"),
    consultationId: consultation1.consultationId,
    breastfeeding: "Exclusive",
    bottleFeeding: "No",
    feedingFrequency: "3 times/day",
    complementaryFeedingStart: "6 months",
    consumedFoods: "Varied solids",
    dailyFoodQuantity: "3 servings",
    recentIllnesses: "None",
    vaccinationStatus: "Complete",
    averageSleepHours: 9,
    sleepRoutine: "Regular",
    observations: "Healthy child",
  });

  // -------- History ----------
  const history1: History = {
    historyId: uid("mh"),
    patientId: patient1.patientId,
    creationDate: new Date("2025-01-15"),
  };
  db.histories.push(history1);

  // -------- Diagnosis ----------
  const diagnosis1: Diagnosis = {
    diagnosisId: uid("dia"),
    consultationId: consultation1.consultationId,
    medicalHistoryId: history1.historyId,
    bmi: 14.8,
    zScorePercentile: 50,
    nutritionalDiagnosis: "Normal",
    diagnosisDetails: "Child has normal growth for age",
  };
  db.diagnoses.push(diagnosis1);

  // -------- Recommendation ----------
  const recommendation1: Recommendation = {
    recommendationId: uid("rec"),
    diagnosisId: diagnosis1.diagnosisId,
    medicalRecommendation: "Regular checkup every 3 months",
    dietaryRecommendation: "Balanced diet with fruits and vegetables",
  };
  db.recommendations.push(recommendation1);

  // -------- Food ----------
  const food1: Food = {
    foodId: uid("f"),
    foodName: "Apple",
    category: "Fruit",
    energyKcal: 52,
    proteinG: 0.3,
    fatG: 0.2,
    carbohydratesG: 14,
    fiberG: 2.4,
    vitamins: "C",
    minerals: "K, Mg",
  };
  db.foods.push(food1);

  // -------- RecommendationFood ----------
  db.recommendationFoods.push({
    recommendationFoodId: uid("rf"),
    recommendationId: recommendation1.recommendationId,
    foodId: food1.foodId,
    dailyAmount: "2 pieces",
    referenceAge: "3-5 years",
  });

  // -------- PatientProgress ----------
  db.patientProgress.push({
    progressId: uid("pp"),
    patientId: patient1.patientId,
    date: new Date("2025-02-15"),
    weightKg: 14.5,
    heightCm: 99,
    bmi: 14.7,
  });

  // -------- Report ----------
  db.reports.push({
    reportId: uid("rep"),
    userId: userAdmin.userId,
    reportType: "Growth Summary",
    format: "PDF",
    analysisPeriod: "Jan 2025 - Feb 2025",
    generationDate: new Date("2025-02-16"),
  });
}
