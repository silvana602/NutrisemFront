"use client";

import { Heading } from "@/components/atoms/Heading";
import { IconButton } from "@/components/atoms/IconButton";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import { MetricsGrid } from "@/components/molecules/MetricsGrid";
import { LastPatientCard } from "@/components/molecules/LastPatientCard";
import { ChartsGrid } from "@/components/molecules/ChartsGrid";
import { db } from "@/mocks/db";
import { calculateAge } from "@/lib/utils";

export const ClinicianDashboardContent = ({ user }: { user: any }) => {
  // Buscar el clínico correspondiente al usuario
  const clinician = db.clinicians.find((c) => c.userId === user.userId);

  // Buscar la relación paciente-clínico
  const relation = clinician
    ? db.patientclinician.find((pc) => pc.clinicianId === clinician.clinicianId)
    : null;

  // Buscar al paciente relacionado
  const patient = relation
    ? db.patients.find((p) => p.patientId === relation.patientId)
    : null;

  // Buscar los datos del usuario del paciente
  const patientUser = patient
    ? db.users.find((u) => u.userId === patient.userId)
    : null;

  // Construir la información del último paciente
  const lastPatient = patient
    ? {
        name: `${patientUser?.firstName ?? ""} ${patientUser?.lastName ?? ""}`,
        parentName: patient?.tutors?.[0]
          ? `${patient.tutors[0].firstName} ${patient.tutors[0].lastName}`
          : "Sin tutor",
        idCard: user.patient?.identityCard ?? "N/A",
        age: patient?.birthDate ? calculateAge(patient.birthDate) : "N/A",
        gender: patient?.gender === "female" ? "Femenino" : "Masculino",
        weight: user.patient?.weight ?? "N/A",
        height: user.patient?.height ?? "N/A",
        status: user.patient?.status ?? "Sin estado",
      }
    : {
        name: "Paciente no encontrado",
        parentName: "N/A",
        idCard: "N/A",
        age: "N/A",
        gender: "N/A",
        weight: "N/A",
        height: "N/A",
        status: "N/A",
      };

  // Métricas de ejemplo
  const metrics = [
    { value: 40, label: " Pacientes" },
    { value: 22, label: " Pacientes mujeres" },
    { value: 18, label: " Pacientes varones" },
  ];

  return (
    <div className="p-6">
      <Heading>
        Bienvenid@, Dr(a) {user.firstName} {user.lastName}
      </Heading>

      <div className="flex gap-4 mt-4">
        <IconButton label="Añadir nueva consulta" />
        <IconButton label="Añadir nuevo paciente" />
      </div>

      {patient && Boolean(user?.patient?.status) && (
        <>
          <SectionTitle>Último paciente</SectionTitle>
          <LastPatientCard patient={lastPatient} />
        </>
      )}

      <SectionTitle>Datos de las últimas semanas</SectionTitle>
      <MetricsGrid metrics={metrics} />

      <ChartsGrid />
    </div>
  );
};
