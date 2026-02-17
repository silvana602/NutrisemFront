"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { validateRange } from "@/utils/validators";
import {
  useConsultationStore,
  type ClinicalFormState,
} from "@/store/useConsultationStore";

type MultiValueInput = string[] | string | null | undefined;

const LEGACY_MULTI_FIELDS = [
  "activityLevel",
  "apathy",
  "hairCondition",
  "skinCondition",
  "edema",
  "dentition",
  "dehydration",
] as const;

const CLINICAL_STEPS = [
  { id: "general", title: "2.1 Estado General del Paciente" },
  { id: "physical", title: "2.2 Signos Fisicos" },
  { id: "digestive", title: "2.3 Sintomas Digestivos" },
  { id: "vitals", title: "2.4 Signos Vitales" },
] as const;

const ACTIVITY_OPTIONS = [
  "JUEGA",
  "CAMINA",
  "SE MUEVE CON NORMALIDAD",
  "INACTIVO",
] as const;

const MOOD_OPTIONS = ["APATIA", "LETARGO", "IRRITABILIDAD", "NORMAL"] as const;
const HAIR_OPTIONS = ["FINO", "FRAGIL", "QUEBRADIZO", "DESPIGMENTADO", "NORMAL"] as const;
const SKIN_OPTIONS = [
  "RESEQUEDAD",
  "DESCAMACION",
  "LESIONES",
  "CAMBIOS DE COLOR",
  "PALIDEZ",
  "NORMAL",
] as const;
const EDEMA_OPTIONS = ["EN PIES", "EN TOBILLOS", "EN ROSTRO", "NO PRESENTA"] as const;
const DENTITION_OPTIONS = [
  "NORMAL",
  "RETARDO EN DENTICION",
  "DEFORMIDADES OSEAS PRESENTES",
] as const;

const YES_NO_OPTIONS = ["SI", "NO"] as const;
const DEHYDRATION_OPTIONS = ["LEVE", "MODERADA", "SEVERA", "NO PRESENTA"] as const;

type VitalField = "temperatureCelsius" | "heartRate" | "respiratoryRate";

function normalizeMultiValues(value: MultiValueInput): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string" && value.trim()) {
    return [value];
  }

  return [];
}

function sameValues(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function MultiOptionGroup({
  label,
  values,
  options,
  exclusiveOptions = [],
  disabled,
  onChange,
}: {
  label: string;
  values?: string[] | string;
  options: readonly string[];
  exclusiveOptions?: readonly string[];
  disabled?: boolean;
  onChange: (value: string[]) => void;
}) {
  const selectedValues = normalizeMultiValues(values);
  const hasExclusiveSelected = selectedValues.some((value) =>
    exclusiveOptions.includes(value)
  );

  const toggleValue = (value: string) => {
    const isSelected = selectedValues.includes(value);
    if (isSelected) {
      onChange(selectedValues.filter((item) => item !== value));
      return;
    }

    if (exclusiveOptions.includes(value)) {
      onChange([value]);
      return;
    }

    const withoutExclusives = selectedValues.filter(
      (item) => !exclusiveOptions.includes(item)
    );
    onChange([...withoutExclusives, value]);
  };

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-nutri-dark-grey">{label}</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => {
          const checked = selectedValues.includes(option);
          const optionDisabled =
            disabled || (hasExclusiveSelected && !exclusiveOptions.includes(option));

          return (
            <label
              key={option}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium sm:text-sm",
                checked
                  ? "border-nutri-primary bg-nutri-primary/10 text-nutri-primary"
                  : "border-nutri-light-grey bg-nutri-white text-nutri-dark-grey",
                optionDisabled && "cursor-not-allowed opacity-60"
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={optionDisabled}
                className="h-4 w-4 rounded border-nutri-light-grey accent-nutri-primary"
                onChange={() => toggleValue(option)}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function SingleOptionGroup({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value?: string;
  options: readonly string[];
  disabled?: boolean;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-nutri-dark-grey">{label}</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((option) => {
          const checked = value === option;
          return (
            <label
              key={option}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium sm:text-sm",
                checked
                  ? "border-nutri-primary bg-nutri-primary/10 text-nutri-primary"
                  : "border-nutri-light-grey bg-nutri-white text-nutri-dark-grey",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                className="h-4 w-4 rounded border-nutri-light-grey accent-nutri-primary"
                onChange={(event) => onChange(event.target.checked ? option : undefined)}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function toFieldPatch<K extends keyof ClinicalFormState>(
  field: K,
  value: ClinicalFormState[K]
): Partial<ClinicalFormState> {
  return { [field]: value } as Partial<ClinicalFormState>;
}

export const ClinicalForm = () => {
  const { selectedPatientId, clinical, setClinical, setClinicalValidity } =
    useConsultationStore();

  const isPatientSelected = Boolean(selectedPatientId);

  const activityValues = normalizeMultiValues(clinical.activityLevel as MultiValueInput);
  const apathyValues = normalizeMultiValues(clinical.apathy as MultiValueInput);
  const hairValues = normalizeMultiValues(clinical.hairCondition as MultiValueInput);
  const skinValues = normalizeMultiValues(clinical.skinCondition as MultiValueInput);
  const edemaValues = normalizeMultiValues(clinical.edema as MultiValueInput);
  const dentitionValues = normalizeMultiValues(clinical.dentition as MultiValueInput);
  const dehydrationValues = normalizeMultiValues(clinical.dehydration as MultiValueInput);

  const stepKey = selectedPatientId ?? "__no-patient__";
  const [stepByPatient, setStepByPatient] = useState<Record<string, number>>({});
  const rawStep = stepByPatient[stepKey] ?? 0;

  const setCurrentStep = (step: number) => {
    setStepByPatient((prev) => ({
      ...prev,
      [stepKey]: Math.max(0, Math.min(step, CLINICAL_STEPS.length - 1)),
    }));
  };

  const setField = <K extends keyof ClinicalFormState>(
    field: K,
    value: ClinicalFormState[K]
  ) => {
    if (!isPatientSelected) return;
    setClinical(toFieldPatch(field, value));
  };

  const handleVitalInput = (field: VitalField, rawValue: string) => {
    if (!isPatientSelected) return;

    const trimmed = rawValue.trim();
    if (!trimmed) {
      setField(field, undefined);
      return;
    }

    const normalized = trimmed.replace(",", ".");
    const value = Number.parseFloat(normalized);
    if (Number.isNaN(value)) return;

    setField(field, value);
  };

  const temperatureError =
    clinical.temperatureCelsius !== undefined
      ? validateRange(clinical.temperatureCelsius, 30, 45, "Temperatura")
      : null;
  const heartRateError =
    clinical.heartRate !== undefined
      ? validateRange(clinical.heartRate, 40, 240, "Frecuencia cardiaca")
      : null;
  const respiratoryRateError =
    clinical.respiratoryRate !== undefined
      ? validateRange(clinical.respiratoryRate, 8, 80, "Frecuencia respiratoria")
      : null;

  const bloodPressureValue = clinical.bloodPressure?.trim() ?? "";
  const bloodPressureError =
    bloodPressureValue && !/^\d{2,3}(?:\/\d{2,3})?$/.test(bloodPressureValue)
      ? "Formato esperado: 100/60 o 95"
      : null;

  const isGeneralComplete = Boolean(
    activityValues.length && apathyValues.length
  );

  const isPhysicalComplete = Boolean(
    hairValues.length &&
      skinValues.length &&
      edemaValues.length &&
      dentitionValues.length
  );

  const isDigestiveComplete = Boolean(
    clinical.diarrhea && clinical.vomiting && dehydrationValues.length
  );

  const isBloodPressureValid = !bloodPressureValue || !bloodPressureError;

  const isVitalsComplete = Boolean(
    clinical.temperatureCelsius !== undefined &&
      clinical.heartRate !== undefined &&
      clinical.respiratoryRate !== undefined &&
      !temperatureError &&
      !heartRateError &&
      !respiratoryRateError &&
      isBloodPressureValid
  );

  const isClinicalComplete =
    isPatientSelected &&
    isGeneralComplete &&
    isPhysicalComplete &&
    isDigestiveComplete &&
    isVitalsComplete;

  useEffect(() => {
    setClinicalValidity(isClinicalComplete);
  }, [isClinicalComplete, setClinicalValidity]);

  useEffect(() => {
    const patch: Partial<ClinicalFormState> = {};
    let hasPatch = false;

    for (const field of LEGACY_MULTI_FIELDS) {
      const rawValue = clinical[field] as unknown as MultiValueInput;
      const normalized = normalizeMultiValues(rawValue);
      const currentArray = Array.isArray(rawValue)
        ? rawValue.filter((item): item is string => typeof item === "string")
        : null;

      if (!currentArray || !sameValues(currentArray, normalized)) {
        patch[field] = normalized;
        hasPatch = true;
      }
    }

    if (hasPatch) {
      setClinical(patch);
    }
  }, [clinical, setClinical]);

  const maxUnlockedStep = useMemo(() => {
    if (!isPatientSelected) return 0;
    if (!isGeneralComplete) return 0;
    if (!isPhysicalComplete) return 1;
    if (!isDigestiveComplete) return 2;
    return 3;
  }, [isPatientSelected, isGeneralComplete, isPhysicalComplete, isDigestiveComplete]);

  const currentStep = Math.min(rawStep, maxUnlockedStep);
  const canGoBack = isPatientSelected && currentStep > 0;

  return (
    <section className="space-y-6 rounded-xl bg-nutri-white p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-nutri-primary">Datos Clinicos</h3>

      {!isPatientSelected && (
        <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white px-4 py-3 text-sm text-nutri-dark-grey">
          Selecciona un paciente para registrar sus datos clinicos.
        </p>
      )}

      <div className={cn("space-y-5", !isPatientSelected && "opacity-60")}>
        <header className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-4 py-3">
          <p className="text-sm font-semibold text-nutri-dark-grey">
            {CLINICAL_STEPS[currentStep].title}
          </p>
        </header>

        {currentStep === 0 && (
          <div className="space-y-6 rounded-lg border border-nutri-dark-grey/40 bg-nutri-white p-4 sm:p-5">
            <MultiOptionGroup
              label="Nivel de actividad"
              values={activityValues}
              options={ACTIVITY_OPTIONS}
              exclusiveOptions={["INACTIVO"]}
              disabled={!isPatientSelected}
              onChange={(value) => setField("activityLevel", value)}
            />

            <MultiOptionGroup
              label="Presencia de desanimo"
              values={apathyValues}
              options={MOOD_OPTIONS}
              exclusiveOptions={["NORMAL"]}
              disabled={!isPatientSelected}
              onChange={(value) => setField("apathy", value)}
            />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-nutri-dark-grey">Observaciones</label>
              <textarea
                rows={3}
                disabled={!isPatientSelected}
                value={clinical.generalObservations ?? ""}
                onChange={(event) => setField("generalObservations", event.target.value)}
                className="nutri-input min-h-24 resize-y"
                placeholder="Anota hallazgos generales..."
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6 rounded-lg border border-nutri-dark-grey/40 bg-nutri-white p-4 sm:p-5">
            <MultiOptionGroup
              label="Cabello"
              values={hairValues}
              options={HAIR_OPTIONS}
              exclusiveOptions={["NORMAL"]}
              disabled={!isPatientSelected}
              onChange={(value) => setField("hairCondition", value)}
            />

            <MultiOptionGroup
              label="Piel"
              values={skinValues}
              options={SKIN_OPTIONS}
              exclusiveOptions={["NORMAL"]}
              disabled={!isPatientSelected}
              onChange={(value) => setField("skinCondition", value)}
            />

            <MultiOptionGroup
              label="Edema"
              values={edemaValues}
              options={EDEMA_OPTIONS}
              exclusiveOptions={["NO PRESENTA"]}
              disabled={!isPatientSelected}
              onChange={(value) => setField("edema", value)}
            />

            <MultiOptionGroup
              label="Denticion y sistema oseo"
              values={dentitionValues}
              options={DENTITION_OPTIONS}
              exclusiveOptions={["NORMAL"]}
              disabled={!isPatientSelected}
              onChange={(value) => setField("dentition", value)}
            />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-nutri-dark-grey">Observaciones</label>
              <textarea
                rows={3}
                disabled={!isPatientSelected}
                value={clinical.physicalObservations ?? ""}
                onChange={(event) => setField("physicalObservations", event.target.value)}
                className="nutri-input min-h-24 resize-y"
                placeholder="Anota detalles de signos fisicos..."
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 rounded-lg border border-nutri-dark-grey/40 bg-nutri-white p-4 sm:p-5">
            <SingleOptionGroup
              label="Presencia de diarrea"
              value={clinical.diarrhea}
              options={YES_NO_OPTIONS}
              disabled={!isPatientSelected}
              onChange={(value) => setField("diarrhea", value)}
            />

            <SingleOptionGroup
              label="Presencia de vomitos"
              value={clinical.vomiting}
              options={YES_NO_OPTIONS}
              disabled={!isPatientSelected}
              onChange={(value) => setField("vomiting", value)}
            />

            <MultiOptionGroup
              label="Signos de deshidratacion"
              values={dehydrationValues}
              options={DEHYDRATION_OPTIONS}
              exclusiveOptions={["NO PRESENTA"]}
              disabled={!isPatientSelected}
              onChange={(value) => setField("dehydration", value)}
            />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-nutri-dark-grey">Observaciones</label>
              <textarea
                rows={3}
                disabled={!isPatientSelected}
                value={clinical.digestiveObservations ?? ""}
                onChange={(event) => setField("digestiveObservations", event.target.value)}
                className="nutri-input min-h-24 resize-y"
                placeholder="Detalles de sintomas digestivos..."
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 rounded-lg border border-nutri-dark-grey/40 bg-nutri-white p-4 sm:p-5">
            <div className="hidden grid-cols-[170px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 md:grid">
              <span />
              <span className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                Medicion
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
                Observaciones
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[170px_minmax(0,1fr)_minmax(0,1fr)] md:items-start">
              <label className="pt-2 text-sm font-semibold text-nutri-dark-grey">Temperatura</label>
              <div className="space-y-1.5">
                <input
                  type="number"
                  step="0.1"
                  disabled={!isPatientSelected}
                  value={clinical.temperatureCelsius ?? ""}
                  onChange={(event) => handleVitalInput("temperatureCelsius", event.target.value)}
                  className={cn("nutri-input", temperatureError && "border-nutri-secondary")}
                  placeholder="Medido en grados celsius (°C)"
                />
                {temperatureError && (
                  <p className="text-xs font-medium text-nutri-secondary">{temperatureError}</p>
                )}
              </div>
              <input
                type="text"
                disabled={!isPatientSelected}
                value={clinical.temperatureObservation ?? ""}
                onChange={(event) => setField("temperatureObservation", event.target.value)}
                className="nutri-input"
                placeholder="Observaciones"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[170px_minmax(0,1fr)_minmax(0,1fr)] md:items-start">
              <label className="pt-2 text-sm font-semibold text-nutri-dark-grey">
                Frecuencia cardiaca
              </label>
              <div className="space-y-1.5">
                <input
                  type="number"
                  step="1"
                  disabled={!isPatientSelected}
                  value={clinical.heartRate ?? ""}
                  onChange={(event) => handleVitalInput("heartRate", event.target.value)}
                  className={cn("nutri-input", heartRateError && "border-nutri-secondary")}
                  placeholder="Medida de latidos por minuto (lpm)"
                />
                {heartRateError && (
                  <p className="text-xs font-medium text-nutri-secondary">{heartRateError}</p>
                )}
              </div>
              <input
                type="text"
                disabled={!isPatientSelected}
                value={clinical.heartRateObservation ?? ""}
                onChange={(event) => setField("heartRateObservation", event.target.value)}
                className="nutri-input"
                placeholder="Observaciones"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[170px_minmax(0,1fr)_minmax(0,1fr)] md:items-start">
              <label className="pt-2 text-sm font-semibold text-nutri-dark-grey">
                Frecuencia respiratoria
              </label>
              <div className="space-y-1.5">
                <input
                  type="number"
                  step="1"
                  disabled={!isPatientSelected}
                  value={clinical.respiratoryRate ?? ""}
                  onChange={(event) => handleVitalInput("respiratoryRate", event.target.value)}
                  className={cn("nutri-input", respiratoryRateError && "border-nutri-secondary")}
                  placeholder="Medida de respiros por minuto (rpm)"
                />
                {respiratoryRateError && (
                  <p className="text-xs font-medium text-nutri-secondary">
                    {respiratoryRateError}
                  </p>
                )}
              </div>
              <input
                type="text"
                disabled={!isPatientSelected}
                value={clinical.respiratoryRateObservation ?? ""}
                onChange={(event) =>
                  setField("respiratoryRateObservation", event.target.value)
                }
                className="nutri-input"
                placeholder="Observaciones"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[170px_minmax(0,1fr)_minmax(0,1fr)] md:items-start">
              <label className="pt-2 text-sm font-semibold text-nutri-dark-grey">
                Presion arterial
              </label>
              <div className="space-y-1.5">
                <input
                  type="text"
                  disabled={!isPatientSelected}
                  value={clinical.bloodPressure ?? ""}
                  onChange={(event) => setField("bloodPressure", event.target.value)}
                  className={cn("nutri-input", bloodPressureError && "border-nutri-secondary")}
                  placeholder="Medido en milimetros de mercurio (mmHg)"
                />
                {bloodPressureError && (
                  <p className="text-xs font-medium text-nutri-secondary">{bloodPressureError}</p>
                )}
                <p className="text-xs text-nutri-dark-grey/80">
                  Campo opcional. Puedes dejarlo vacio cuando no corresponda.
                </p>
              </div>
              <input
                type="text"
                disabled={!isPatientSelected}
                value={clinical.bloodPressureObservation ?? ""}
                onChange={(event) => setField("bloodPressureObservation", event.target.value)}
                className="nutri-input"
                placeholder="Observaciones"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {canGoBack && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Punto anterior
              </Button>
            )}
          </div>
          <div />
        </div>

        <div className="flex items-center justify-center gap-2 pt-1">
          {CLINICAL_STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isUnlocked = index <= maxUnlockedStep;
            return (
              <button
                key={step.id}
                type="button"
                aria-label={`Ir al punto ${index + 1}`}
                disabled={!isUnlocked || !isPatientSelected}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "h-3.5 w-3.5 rounded-full border transition-colors",
                  isActive
                    ? "border-nutri-primary bg-nutri-primary"
                    : isUnlocked
                      ? "border-nutri-secondary bg-nutri-white hover:bg-nutri-secondary/25"
                      : "cursor-not-allowed border-nutri-light-grey bg-nutri-light-grey/70"
                )}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
