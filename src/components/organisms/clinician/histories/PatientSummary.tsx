"use client";

import React from "react";
import { calculateAge } from "@/lib/utils";
import { db } from "@/mocks/db";

import type { Patient } from "@/types/patient";
import type { Guardian, User } from "@/types";

interface Props {
  patient: Patient;
}

export const PatientSummary: React.FC<Props> = ({ patient }) => {
  // 🔹 Buscar usuario
  const user: User | undefined = db.users.find(
    (u: User) => u.userId === patient.userId
  );

  // 🔹 Buscar tutor/guardian
  const guardian: Guardian | undefined = db.guardians.find(
    (g: Guardian) => g.patientId === patient.patientId
  );
  const tutorName = guardian ? `${guardian.firstName} ${guardian.lastName}` : "-";

  if (!user) {
    return <p className="text-sm text-nutri-primary">Usuario no encontrado.</p>;
  }

  const age = patient.birthDate ? calculateAge(patient.birthDate) : "-";

  const genderLabel =
    patient.gender === "male"
      ? "Masculino"
      : patient.gender === "female"
      ? "Femenino"
      : "Otro";

  return (
    <div className="space-y-2 rounded-md bg-nutri-white p-4 shadow">
      <h2 className="text-lg font-semibold text-nutri-dark-grey">Resumen del Paciente</h2>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <strong>Nombre:</strong> {user.firstName} {user.lastName}
        </div>

        <div>
          <strong>Tutor:</strong> {tutorName}
        </div>

        <div>
          <strong>CI:</strong> {user.identityNumber}
        </div>

        <div>
          <strong>Teléfono:</strong> {user.phone}</div>

        <div>
          <strong>Edad:</strong> {age}
        </div>

        <div>
          <strong>Sexo:</strong> {genderLabel}
        </div>
      </div>
    </div>
  );
};

export default PatientSummary;
