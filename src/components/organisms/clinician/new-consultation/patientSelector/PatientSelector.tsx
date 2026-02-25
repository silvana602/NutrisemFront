"use client";

import React, { useMemo, useState } from "react";
import { SearchBar } from "@/components/molecules/SearchBar";
import { db, seedOnce } from "@/mocks/db";
import { Button } from "@/components/ui/Button";
import { useConsultationStore } from "@/store/useConsultationStore";
import {
  calculateAgeInMonths,
  formatPediatricAge,
  isTargetPediatricAge,
  PEDIATRIC_MAX_AGE_MONTHS,
  PEDIATRIC_MIN_AGE_MONTHS,
} from "@/lib/pediatricAge";
import type { Patient } from "@/types";

seedOnce();

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const PatientSelector: React.FC = () => {
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectedPatientId = useConsultationStore((s) => s.selectedPatientId);
  const setSelectedPatientId = useConsultationStore((s) => s.setSelectedPatientId);
  const clearAnthropometric = useConsultationStore((s) => s.clearAnthropometric);

  const patients = db.patients;
  const eligiblePatients = useMemo(
    () => patients.filter((patient) => isTargetPediatricAge(calculateAgeInMonths(patient.birthDate))),
    [patients]
  );

  const selectedPatient = useMemo(
    () => patients.find((p) => p.patientId === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  const selectedPatientAgeMonths = useMemo(
    () => (selectedPatient ? calculateAgeInMonths(selectedPatient.birthDate) : null),
    [selectedPatient]
  );

  const isSelectedPatientInTargetAge =
    selectedPatientAgeMonths !== null && isTargetPediatricAge(selectedPatientAgeMonths);

  const filteredPatients = useMemo(() => {
    if (query.trim().length < 3) return [];
    const normalizedQuery = normalize(query);

    return eligiblePatients.filter((patient) => {
      const fullName = normalize(`${patient.firstName} ${patient.lastName}`);
      const ci = normalize(patient.identityNumber);
      return fullName.includes(normalizedQuery) || ci.includes(normalizedQuery);
    });
  }, [query, eligiblePatients]);

  const clearPatientAnthropometricDraft = () => {
    clearAnthropometric();
  };

  const handleSelect = (patient: Patient) => {
    if (selectedPatientId !== patient.patientId) {
      clearPatientAnthropometricDraft();
    }

    setSelectedPatientId(patient.patientId);
    setQuery("");
    setHighlightedIndex(0);
  };

  const handleClearSelection = () => {
    if (!selectedPatientId) return;
    clearPatientAnthropometricDraft();
    setSelectedPatientId(null);
    setQuery("");
    setHighlightedIndex(0);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredPatients.length) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((index) => (index < filteredPatients.length - 1 ? index + 1 : 0));
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((index) => (index > 0 ? index - 1 : filteredPatients.length - 1));
        break;
      case "Enter":
        event.preventDefault();
        handleSelect(filteredPatients[highlightedIndex]);
        break;
      case "Escape":
        setQuery("");
        setHighlightedIndex(0);
        break;
    }
  };

  return (
    <section className="relative w-full">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-nutri-black)]">
        Buscar paciente registrado
      </h3>
      <p className="mt-1 text-xs text-[var(--color-nutri-dark-grey)]">
        Consulta pediatrica orientada a pacientes de {PEDIATRIC_MIN_AGE_MONTHS} a{" "}
        {PEDIATRIC_MAX_AGE_MONTHS} meses.
      </p>

      <div onKeyDown={handleKeyDown}>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nombre o cedula de identidad"
          containerClassName="max-w-xl"
        />
      </div>

      {query.length >= 3 && filteredPatients.length > 0 && (
        <ul
          role="listbox"
          className="nutri-clinician-surface absolute z-10 mt-1 w-full max-w-xl overflow-hidden rounded-lg border border-[var(--color-nutri-light-grey)] bg-[var(--color-nutri-white)] shadow-md"
        >
          {filteredPatients.map((patient, index) => (
            <li
              key={patient.patientId}
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => handleSelect(patient)}
              className={`cursor-pointer px-4 py-2 transition-colors ${
                index === highlightedIndex
                  ? "bg-[var(--color-nutri-light-grey)]"
                  : "hover:bg-[var(--color-nutri-off-white)]"
              }`}
            >
              <p className="text-sm font-medium text-[var(--color-nutri-black)]">
                {patient.firstName} {patient.lastName}
              </p>
              <p className="text-xs text-[var(--color-nutri-dark-grey)]">CI: {patient.identityNumber}</p>
              <p className="text-xs text-[var(--color-nutri-dark-grey)]">
                Edad: {formatPediatricAge(calculateAgeInMonths(patient.birthDate))}
              </p>
            </li>
          ))}
        </ul>
      )}

      {selectedPatient && (
        <div className="nutri-clinician-surface-soft mt-4 rounded-lg border border-[var(--color-nutri-light-grey)] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--color-nutri-dark-grey)]">Consulta al paciente:</p>
              <p className="text-base font-semibold text-[var(--color-nutri-primary)]">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </p>
              <p className="text-xs text-[var(--color-nutri-dark-grey)]">
                Edad:{" "}
                {selectedPatientAgeMonths !== null
                  ? formatPediatricAge(selectedPatientAgeMonths)
                  : "Sin dato"}
              </p>
              {!isSelectedPatientInTargetAge && (
                <p className="text-xs font-medium text-nutri-secondary">
                  Fuera del rango objetivo (6 meses - 5 años). Selecciona otro paciente para esta
                  consulta.
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              className="px-3 py-1.5 text-xs"
              onClick={handleClearSelection}
            >
              Quitar paciente
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};
