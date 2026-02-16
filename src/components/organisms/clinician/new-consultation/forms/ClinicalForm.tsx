"use client";

import { useEffect, useState } from "react";
import { useConsultationStore } from "@/store/useConsultationStore";
import { validateRange } from "@/utils/validators";
import { ValidatedInput } from "@/components/ui/ValidatedInput";

export const ClinicalForm = () => {
  const {
    selectedPatientId,
    clinical,
    setClinical,
    setClinicalValidity,
  } = useConsultationStore();

  const [ageYears, setAgeYears] = useState(
    clinical.ageYears !== undefined ? clinical.ageYears.toString() : ""
  );
  const [error, setError] = useState<string | undefined>(undefined);

  const isPatientSelected = Boolean(selectedPatientId);

  useEffect(() => {
    setAgeYears(clinical.ageYears !== undefined ? clinical.ageYears.toString() : "");
    setError(undefined);
  }, [selectedPatientId, clinical.ageYears]);

  const handleAgeChange = (rawValue: string) => {
    if (!isPatientSelected) return;

    setAgeYears(rawValue);

    const trimmed = rawValue.trim();
    if (!trimmed) {
      setError("Campo requerido");
      setClinical({ ageYears: undefined });
      return;
    }

    const value = Number.parseInt(trimmed, 10);
    if (Number.isNaN(value)) {
      setError("Numero invalido");
      setClinical({ ageYears: undefined });
      return;
    }

    const rangeError = validateRange(value, 0, 18, "Edad");
    setError(rangeError ?? undefined);

    if (!rangeError) {
      setClinical({ ageYears: value });
    } else {
      setClinical({ ageYears: undefined });
    }
  };

  useEffect(() => {
    if (!isPatientSelected) {
      setClinicalValidity(false);
      return;
    }

    setClinicalValidity(clinical.ageYears !== undefined && !error);
  }, [isPatientSelected, clinical.ageYears, error, setClinicalValidity]);

  return (
    <section className="space-y-6 rounded-xl bg-nutri-white p-6">
      <h3 className="text-lg font-semibold text-nutri-primary">Datos Clinicos</h3>

      {!isPatientSelected && (
        <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white px-4 py-3 text-sm text-nutri-dark-grey">
          Selecciona un paciente para registrar sus datos clinicos.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ValidatedInput
          label="Edad"
          placeholder="Ej: 3"
          suffix="anos"
          value={ageYears}
          error={error}
          disabled={!isPatientSelected}
          onChange={handleAgeChange}
        />
      </div>
    </section>
  );
};

