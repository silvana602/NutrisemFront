"use client";

import React, { useMemo } from "react";
import { calculateAgeInMonths, formatPediatricAge } from "@/lib/pediatricAge";
import { db } from "@/mocks/db";

import type { Patient } from "@/types/patient";
import type { Guardian, User } from "@/types";

interface Props {
  patient: Patient;
}

function getStatusToneClasses(status: string): string {
  const normalized = status
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("desnutricion")) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (normalized.includes("riesgo")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (normalized.includes("sobrepeso") || normalized.includes("obesidad")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export const PatientSummary: React.FC<Props> = ({ patient }) => {
  const user: User | null = useMemo(
    () => db.users.find((item: User) => item.userId === patient.userId) ?? null,
    [patient.userId]
  );

  const guardian: Guardian | null = useMemo(
    () => db.guardians.find((item: Guardian) => item.patientId === patient.patientId) ?? null,
    [patient.patientId]
  );

  const consultations = useMemo(
    () =>
      db.consultations
        .filter((item) => item.patientId === patient.patientId)
        .sort((first, second) => second.date.getTime() - first.date.getTime()),
    [patient.patientId]
  );

  const latestConsultation = consultations[0] ?? null;
  const latestDiagnosis = latestConsultation
    ? db.diagnoses.find((item) => item.consultationId === latestConsultation.consultationId) ?? null
    : null;

  if (!user) {
    return (
      <section className="rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm">
        <p className="text-sm text-nutri-dark-grey">Usuario del paciente no encontrado.</p>
      </section>
    );
  }

  const ageLabel = formatPediatricAge(calculateAgeInMonths(patient.birthDate));
  const genderLabel = patient.gender === "male" ? "Masculino" : "Femenino";
  const tutorName = guardian ? `${guardian.firstName} ${guardian.lastName}` : "Sin tutor registrado";
  const statusLabel = latestDiagnosis?.nutritionalDiagnosis ?? "Sin diagnostico";

  return (
    <section className="rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm sm:p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Resumen del paciente
          </p>
          <h3 className="text-lg font-semibold text-nutri-primary">
            {user.firstName} {user.lastName}
          </h3>
        </div>

        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusToneClasses(
            statusLabel
          )}`}
        >
          {statusLabel}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-2 text-sm text-nutri-dark-grey sm:grid-cols-2 lg:grid-cols-3">
        <p>
          <span className="font-semibold">Tutor:</span> {tutorName}
        </p>
        <p>
          <span className="font-semibold">CI:</span> {user.identityNumber}
        </p>
        <p>
          <span className="font-semibold">Telefono:</span> {guardian?.phone || user.phone || "Sin dato"}
        </p>
        <p>
          <span className="font-semibold">Edad actual:</span> {ageLabel}
        </p>
        <p>
          <span className="font-semibold">Sexo:</span> {genderLabel}
        </p>
        <p>
          <span className="font-semibold">Ultima consulta:</span>{" "}
          {latestConsultation ? latestConsultation.date.toLocaleDateString("es-BO") : "Sin consultas"}
        </p>
        <p className="sm:col-span-2 lg:col-span-3">
          <span className="font-semibold">Direccion:</span>{" "}
          {guardian?.address || user.address || patient.address || "Sin dato"}
        </p>
      </div>
    </section>
  );
};

export default PatientSummary;

