"use client";

import { useEffect, useRef, useState } from "react";
import { useConsultationStore } from "@/store/useConsultationStore";
import { validateRange } from "@/utils/validators";
import { ValidatedInput } from "@/components/ui/ValidatedInput";

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
    if (!isPatientSelected) return;

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
    if (!isPatientSelected) {
      setAnthropometricValidity(false);
      return;
    }

    const hasAllValues =
      anthropometric.weightKg !== undefined &&
      anthropometric.heightM !== undefined &&
      anthropometric.muacCm !== undefined &&
      anthropometric.headCircumferenceCm !== undefined;

    setAnthropometricValidity(hasAllValues && !hasErrors);
  }, [isPatientSelected, anthropometric, hasErrors, setAnthropometricValidity]);

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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ValidatedInput
          label="Peso actual"
          placeholder="Ej: 1.1"
          suffix="kg"
          value={values.weightKg ?? ""}
          error={errors.weightKg}
          disabled={!isPatientSelected}
          onChange={(v) => handleChange("weightKg", v, 1, 300, "Peso")}
        />

        <ValidatedInput
          label="Talla / Longitud"
          placeholder="Ej: 0.3"
          suffix="m"
          value={values.heightM ?? ""}
          error={errors.heightM}
          disabled={!isPatientSelected}
          onChange={(v) => handleChange("heightM", v, 0.3, 2.5, "Talla")}
        />

        <ValidatedInput
          label="Perimetro braquial (MUAC)"
          placeholder="Ej: 5.1"
          suffix="cm"
          value={values.muacCm ?? ""}
          error={errors.muacCm}
          disabled={!isPatientSelected}
          onChange={(v) => handleChange("muacCm", v, 5, 40, "MUAC")}
        />

        <ValidatedInput
          label="Perimetro cefalico"
          placeholder="Ej: 20.1"
          suffix="cm"
          value={values.headCircumferenceCm ?? ""}
          error={errors.headCircumferenceCm}
          disabled={!isPatientSelected}
          onChange={(v) => handleChange("headCircumferenceCm", v, 20, 70, "PC")}
        />
      </div>
    </section>
  );
};
