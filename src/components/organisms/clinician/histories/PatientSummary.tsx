"use client";

import React from "react";
import { calculateAge } from "@/lib/utils"; // tu función para calcular edad
import { db } from "@/mocks/db";

interface Patient {
  patientId: number;
  userId: string; // ahora string
  birthDate?: string;
  gender?: "male" | "female";
  tutors?: { name: string }[];
}

interface User {
  userId: string; // ahora string
  firstName: string;
  lastName: string;
  identityCard?: string;
  phone?: string;
}

interface Props {
  patient: Patient;
}

export const PatientSummary: React.FC<Props> = ({ patient }) => {
  // Buscar usuario correspondiente al paciente
  const user: User | undefined = db.users.find(
    (u: User) => u.userId === patient.userId
  );

  if (!user) return <p>Usuario no encontrado.</p>;

  const age = patient.birthDate ? calculateAge(patient.birthDate) : "-";
  const tutorName = patient.tutors?.[0]?.name ?? "-";
  const phone = user.phone ?? "-";
  const ci = user.identityCard ?? "-";
  const gender =
    patient.gender === "male" ? "Masculino" : patient.gender === "female" ? "Femenino" : "-";

  return (
    <div className="bg-white shadow rounded-md p-4 space-y-2">
      <h2 className="text-lg font-semibold">Resumen del Paciente</h2>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <strong>Nombre:</strong> {user.firstName} {user.lastName}
        </div>
        <div>
          <strong>Edad:</strong> {age}
        </div>
        <div>
          <strong>Sexo:</strong> {gender}
        </div>
        <div>
          <strong>CI:</strong> {ci}
        </div>
        <div>
          <strong>Tutor:</strong> {tutorName}
        </div>
        <div>
          <strong>Teléfono:</strong> {phone}
        </div>
      </div>
    </div>
  );
};
