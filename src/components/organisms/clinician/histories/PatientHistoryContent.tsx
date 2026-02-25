"use client";

import React, { useMemo, useState } from "react";
import { SearchBar } from "@/components/molecules/SearchBar";
import { Button } from "@/components/ui/Button";
import { PatientSummary } from "./PatientSummary";
import { PatientsHistoryTable } from "./PatientHistoryTable";
import { seedOnce, db } from "@/mocks/db";
import { useAuthStore } from "@/store/useAuthStore";

import type { Patient } from "@/types";

type PatientOption = {
  patient: Patient;
  patientName: string;
  ci: string;
  tutorName: string;
  lastConsultLabel: string;
  lastConsultTimestamp: number | null;
  consultationsCount: number;
};

seedOnce();

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export const PatientHistoryContent: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const clinician = useMemo(
    () => (user ? db.clinicians.find((item) => item.userId === user.userId) ?? null : null),
    [user]
  );

  const patientOptions: PatientOption[] = useMemo(() => {
    if (!clinician) return [];

    const assignedPatientIds = new Set(
      db.patientClinicians
        .filter((item) => item.clinicianId === clinician.clinicianId)
        .map((item) => item.patientId)
    );

    return db.patients
      .filter((patient) => assignedPatientIds.has(patient.patientId))
      .map((patient) => {
        const patientUser = db.users.find((userItem) => userItem.userId === patient.userId) ?? null;
        const guardian = db.guardians.find((guardianItem) => guardianItem.patientId === patient.patientId) ?? null;

        const consultations = db.consultations
          .filter((consultation) => consultation.patientId === patient.patientId)
          .sort((first, second) => second.date.getTime() - first.date.getTime());

        const lastConsultation = consultations[0] ?? null;

        return {
          patient,
          patientName: patientUser
            ? `${patientUser.firstName} ${patientUser.lastName}`
            : `${patient.firstName} ${patient.lastName}`,
          ci: patientUser?.identityNumber ?? patient.identityNumber,
          tutorName: guardian
            ? `${guardian.firstName} ${guardian.lastName}`
            : "Sin tutor registrado",
          lastConsultLabel: lastConsultation
            ? lastConsultation.date.toLocaleDateString("es-BO")
            : "Sin consultas",
          lastConsultTimestamp: lastConsultation?.date.getTime() ?? null,
          consultationsCount: consultations.length,
        } satisfies PatientOption;
      })
      .sort((first, second) => {
        const secondTimestamp = second.lastConsultTimestamp ?? 0;
        const firstTimestamp = first.lastConsultTimestamp ?? 0;

        if (secondTimestamp !== firstTimestamp) return secondTimestamp - firstTimestamp;
        return first.patientName.localeCompare(second.patientName, "es");
      });
  }, [clinician]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeText(search.trim());
    if (!normalizedQuery) return patientOptions;

    return patientOptions.filter((option) => {
      return (
        normalizeText(option.patientName).includes(normalizedQuery) ||
        normalizeText(option.ci).includes(normalizedQuery) ||
        normalizeText(option.tutorName).includes(normalizedQuery)
      );
    });
  }, [patientOptions, search]);

  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patientOptions.find((option) => option.patient.patientId === selectedPatientId)?.patient ?? null;
  }, [patientOptions, selectedPatientId]);

  const visibleOptions = useMemo(() => {
    if (selectedPatient) return [];
    if (search.trim().length > 0) return filteredOptions;
    return patientOptions.slice(0, 8);
  }, [filteredOptions, patientOptions, search, selectedPatient]);

  const showEmptySearch = !selectedPatient && search.trim().length > 0 && filteredOptions.length === 0;
  const showAssignedEmpty = patientOptions.length === 0;

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-nutri-dark-grey">Historiales clinicos</h2>
        <p className="text-sm text-nutri-dark-grey/80">
          Busca un paciente por nombre, CI o tutor para revisar su historial de consultas.
        </p>
      </header>

      <section className="nutri-clinician-surface-soft p-4 sm:p-5">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar paciente por nombre, CI o tutor"
          containerClassName="mt-0 max-w-none"
        />

        {showAssignedEmpty && (
          <p className="mt-4 rounded-lg border border-nutri-light-grey bg-nutri-off-white px-4 py-3 text-sm text-nutri-dark-grey">
            No tienes pacientes asignados para consultar historiales.
          </p>
        )}

        {!showAssignedEmpty && !selectedPatient && visibleOptions.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {visibleOptions.map((option) => (
              <button
                key={option.patient.patientId}
                type="button"
                onClick={() => setSelectedPatientId(option.patient.patientId)}
                className="nutri-clinician-surface rounded-lg border border-nutri-light-grey p-3 text-left transition-colors hover:bg-nutri-off-white"
              >
                <p className="text-sm font-semibold text-nutri-primary">{option.patientName}</p>
                <p className="text-xs text-nutri-dark-grey/80">CI: {option.ci}</p>
                <p className="text-xs text-nutri-dark-grey/80">Tutor: {option.tutorName}</p>
                <p className="mt-1 text-xs text-nutri-dark-grey/80">
                  Ultima consulta: {option.lastConsultLabel} | Registros:{" "}
                  {option.consultationsCount}
                </p>
              </button>
            ))}
          </div>
        )}

        {showEmptySearch && (
          <p className="mt-4 rounded-lg border border-nutri-light-grey bg-nutri-off-white px-4 py-3 text-sm text-nutri-dark-grey">
            No se encontraron pacientes con ese criterio.
          </p>
        )}
      </section>

      {selectedPatient && (
        <section className="space-y-4">
          <div className="nutri-clinician-surface-soft flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm text-nutri-dark-grey">Paciente seleccionado</p>
              <p className="text-base font-semibold text-nutri-primary">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="px-3 py-1.5 text-xs"
              onClick={() => setSelectedPatientId(null)}
            >
              Cambiar paciente
            </Button>
          </div>

          <PatientSummary patient={selectedPatient} />
          <PatientsHistoryTable patientId={selectedPatient.patientId} />
        </section>
      )}
    </div>
  );
};

export default PatientHistoryContent;
