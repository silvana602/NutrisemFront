"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useConsultationStore } from "@/store/useConsultationStore";
import { validateRange } from "@/utils/validators";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { db, seedOnce } from "@/mocks/db";
import {
  calculateAgeInMonths,
  formatPediatricAge,
  isTargetPediatricAge,
} from "@/lib/pediatricAge";

seedOnce();

type EditableAnthroField =
  | "weightKg"
  | "heightM"
  | "muacCm"
  | "headCircumferenceCm";

function toEditableValues(
  anthropometric: ReturnType<typeof useConsultationStore.getState>["anthropometric"]
): Partial<Record<EditableAnthroField, string>> {
  return {
    weightKg:
      anthropometric.weightKg !== undefined
        ? anthropometric.weightKg.toString()
        : "",
    heightM:
      anthropometric.heightM !== undefined
        ? anthropometric.heightM.toString()
        : "",
    muacCm:
      anthropometric.muacCm !== undefined ? anthropometric.muacCm.toString() : "",
    headCircumferenceCm:
      anthropometric.headCircumferenceCm !== undefined
        ? anthropometric.headCircumferenceCm.toString()
        : "",
  };
}

export const AnthropometricForm = () => {
  const {
    selectedPatientId,
    anthropometric,
    setAnthropometric,
    setAnthropometricValidity,
  } = useConsultationStore();

  const [values, setValues] = useState<Partial<Record<EditableAnthroField, string>>>(
    toEditableValues(anthropometric)
  );
  const [errors, setErrors] = useState<Partial<Record<EditableAnthroField, string>>>(
    {}
  );

  const previousPatientIdRef = useRef<string | null>(selectedPatientId);
  const isPatientSelected = Boolean(selectedPatientId);
  const selectedPatient = useMemo(
    () => db.patients.find((patient) => patient.patientId === selectedPatientId) ?? null,
    [selectedPatientId]
  );
  const selectedPatientAgeMonths = useMemo(
    () => (selectedPatient ? calculateAgeInMonths(selectedPatient.birthDate) : null),
    [selectedPatient]
  );
  const isTargetAgeSelected =
    selectedPatientAgeMonths !== null && isTargetPediatricAge(selectedPatientAgeMonths);
  const isFormEnabled = isPatientSelected && isTargetAgeSelected;

  useEffect(() => {
    if (previousPatientIdRef.current === selectedPatientId) return;

    previousPatientIdRef.current = selectedPatientId;
    setValues(toEditableValues(useConsultationStore.getState().anthropometric));
    setErrors({});
  }, [selectedPatientId]);

  const handleChange = (
    key: EditableAnthroField,
    rawValue: string,
    min: number,
    max: number,
    label: string
  ) => {
    if (!isFormEnabled) return;

    setValues((prev) => ({ ...prev, [key]: rawValue }));

    const trimmed = rawValue.trim();
    if (!trimmed) {
      setErrors((prev) => ({ ...prev, [key]: "Campo requerido" }));
      setAnthropometric({ [key]: undefined });
      return;
    }

    const normalized = trimmed.replace(",", ".");
    const value = parseFloat(normalized);

    if (isNaN(value)) {
      setErrors((prev) => ({ ...prev, [key]: "Numero invalido" }));
      setAnthropometric({ [key]: undefined });
      return;
    }

    const error = validateRange(value, min, max, label);
    setErrors((prev) => ({ ...prev, [key]: error ?? undefined }));

    if (!error) {
      setAnthropometric({ [key]: value });
    } else {
      setAnthropometric({ [key]: undefined });
    }
  };

  const hasErrors = Object.values(errors).some(Boolean);

  useEffect(() => {
    if (!isFormEnabled) {
      setAnthropometricValidity(false);
      return;
    }

    const hasAllValues =
      anthropometric.weightKg !== undefined &&
      anthropometric.heightM !== undefined &&
      anthropometric.muacCm !== undefined &&
      anthropometric.headCircumferenceCm !== undefined;

    setAnthropometricValidity(hasAllValues && !hasErrors);
  }, [isFormEnabled, anthropometric, hasErrors, setAnthropometricValidity]);

  return (
    <section className="space-y-6 rounded-xl bg-nutri-white p-6">
      <h3 className="text-lg font-semibold text-nutri-primary">
        Datos Antropometricos
      </h3>

      {!isPatientSelected && (
        <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white px-4 py-3 text-sm text-nutri-dark-grey">
          Selecciona un paciente para registrar sus datos antropometricos.
        </p>
      )}
      {isPatientSelected && !isTargetAgeSelected && (
        <p className="rounded-lg border border-nutri-secondary/40 bg-nutri-off-white px-4 py-3 text-sm text-nutri-dark-grey">
          Este formulario esta orientado a pacientes de 6 meses a 5 anios. Edad del paciente
          seleccionado:{" "}
          {selectedPatientAgeMonths !== null
            ? formatPediatricAge(selectedPatientAgeMonths)
            : "Sin dato"}.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ValidatedInput
          label="Peso actual"
          placeholder="Ej: 8.4"
          suffix="kg"
          value={values.weightKg ?? ""}
          error={errors.weightKg}
          disabled={!isFormEnabled}
          onChange={(v) => handleChange("weightKg", v, 4, 30, "Peso")}
        />

        <ValidatedInput
          label="Talla / Longitud"
          placeholder="Ej: 0.84"
          suffix="m"
          value={values.heightM ?? ""}
          error={errors.heightM}
          disabled={!isFormEnabled}
          onChange={(v) => handleChange("heightM", v, 0.6, 1.25, "Talla")}
        />

        <ValidatedInput
          label="Perimetro braquial (MUAC)"
          placeholder="Ej: 14.2"
          suffix="cm"
          value={values.muacCm ?? ""}
          error={errors.muacCm}
          disabled={!isFormEnabled}
          onChange={(v) => handleChange("muacCm", v, 9, 22, "MUAC")}
        />

        <ValidatedInput
          label="Perimetro cefalico"
          placeholder="Ej: 47.5"
          suffix="cm"
          value={values.headCircumferenceCm ?? ""}
          error={errors.headCircumferenceCm}
          disabled={!isFormEnabled}
          onChange={(v) => handleChange("headCircumferenceCm", v, 40, 54, "PC")}
        />
      </div>
    </section>
  );
};
