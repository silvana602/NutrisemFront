"use client";

import { Heading } from "@/components/atoms/Heading";
import { IconButton } from "@/components/atoms/IconButton";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import { MetricsGrid } from "@/components/molecules/MetricsGrid";
import { LastPatientCard } from "@/components/molecules/LastPatientCard";
import { ChartsGrid } from "@/components/molecules/ChartsGrid";

import { db, seedOnce } from "@/mocks/db";
import { calculateAge } from "@/lib/utils";

import type { User } from "@/types/user";
import type { Patient } from "@/types/patient";
import type { Guardian } from "@/types/guardian";
import type { Consultation } from "@/types/consultation";
import type { AnthropometricData } from "@/types/anthropometricData";
import type { Diagnosis } from "@/types/diagnosis";

interface Props {
  user: User;
}

seedOnce();

export const ClinicianDashboardContent: React.FC<Props> = ({ user }) => {
  /* =====================================================
    1. CLINICIAN
     ===================================================== */
  const clinician = db.clinicians.find(
    (c) => c.userId === user.userId
  );

  if (!clinician) return null;

  /* =====================================================
    2. RELACIÓN CLINICIAN - PATIENT
     ===================================================== */
  const relation = db.patientClinicians.find(
    (pc) => pc.clinicianId === clinician.clinicianId
  );

  if (!relation) return null;

  /* =====================================================
    3. PATIENT
     ===================================================== */
  const patient: Patient | null =
    db.patients.find((p) => p.patientId === relation.patientId) ?? null;

  if (!patient) return null;

  /* =====================================================
    4. USER DEL PACIENTE
     ===================================================== */
  const patientUser =
    db.users.find((u) => u.userId === patient.userId) ?? null;

  /* =====================================================
    5. GUARDIAN
     ===================================================== */
  const guardian: Guardian | null =
    db.guardians.find((g) => g.patientId === patient.patientId) ?? null;

  /* =====================================================
    6. HISTORIA CLÍNICA
     ===================================================== */
  const history =
    db.histories.find((h) => h.patientId === patient.patientId) ?? null;

  /* =====================================================
    7. ÚLTIMA CONSULTA
     ===================================================== */
  const consultations: Consultation[] = db.consultations
    .filter((c) => c.patientId === patient.patientId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const lastConsultation = consultations[0];

  /* =====================================================
    8. ANTROPOMETRÍA
     ===================================================== */
  const anthropometric: AnthropometricData | null =
    lastConsultation
      ? db.anthropometricData.find(
          (a) => a.consultationId === lastConsultation.consultationId
        ) ?? null
      : null;

  /* =====================================================
    9. DIAGNÓSTICO
     ===================================================== */
  const diagnosis: Diagnosis | null =
    lastConsultation && history
      ? db.diagnoses.find(
          (d) =>
            d.consultationId === lastConsultation.consultationId &&
            d.medicalHistoryId === history.historyId
        ) ?? null
      : null;

  /* =====================================================
    10. OBJETO FINAL PARA LA CARD
     ===================================================== */
  const lastPatient = {
    name: patientUser
      ? `${patientUser.firstName} ${patientUser.lastName}`
      : "Paciente",

    parentName: guardian
      ? `${guardian.firstName} ${guardian.lastName}`
      : "Sin tutor registrado",

    idCard: patient.identityNumber,
    age: calculateAge(patient.birthDate),
    gender: patient.gender === "female" ? "Femenino" : "Masculino",

    weight: anthropometric
      ? `${anthropometric.weightKg} kg`
      : "N/A",

    height: anthropometric
      ? `${anthropometric.heightM} m`
      : "N/A",

    status: diagnosis
      ? diagnosis.nutritionalDiagnosis
      : "Sin diagnóstico",
  };

  /* =====================================================
    11. MÉTRICAS (mock por ahora)
     ===================================================== */
  const metrics = [
    { value: 40, label: "Pacientes" },
    { value: 22, label: "Pacientes mujeres" },
    { value: 18, label: "Pacientes varones" },
  ];

  return (
    <div className="p-4 sm:p-6">
      <Heading>
        Bienvenid@, Dr(a) {user.firstName} {user.lastName}
      </Heading>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <IconButton
          label="Añadir nueva consulta"
          className="w-full justify-center sm:w-auto"
        />
        <IconButton
          label="Añadir nuevo paciente"
          className="w-full justify-center sm:w-auto"
        />
      </div>

      <SectionTitle>Último paciente</SectionTitle>
      <LastPatientCard patient={lastPatient} />

      <SectionTitle>Datos de las últimas semanas</SectionTitle>
      <MetricsGrid metrics={metrics} />

      <ChartsGrid />
    </div>
  );
};
