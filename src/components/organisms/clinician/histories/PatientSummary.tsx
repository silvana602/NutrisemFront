"use client";

import React from "react";
import { db } from "@/mocks/db";
import { calculateAge } from "@/lib/utils";

interface PatientSummaryProps {
  user: any; // Objeto retornado por getUserByCI
}

export const PatientSummary: React.FC<PatientSummaryProps> = ({ user }) => {
  const patient = db.patients.find((p) => p.userId === user.userId);
  const tutor = patient?.tutors?.[0];

  return (
    <div className="bg-white border rounded p-4 grid md:grid-cols-2 gap-4">
      <div>
        <p><strong>Nombre del paciente:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>Cédula de identidad:</strong> {user.identityCard}</p>
        <p><strong>Edad actual:</strong> {calculateAge(patient?.birthDate)}</p>
      </div>
      <div>
        <p><strong>Nombre del padre/tutor:</strong> {tutor ? `${tutor.firstName} ${tutor.lastName}` : "-"}</p>
        <p><strong>Teléfono:</strong> {tutor?.phone ?? user.phone ?? "-"}</p>
        <p><strong>Sexo:</strong> {patient?.gender ?? "-"}</p>
      </div>
    </div>
  );
};
