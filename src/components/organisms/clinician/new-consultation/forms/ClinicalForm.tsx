"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { validateRange } from "@/utils/validators";
import { MultiSelectOptionGroup, SingleSelectOptionGroup } from "./shared/OptionGroups";
import { StepDots } from "./shared/StepDots";
import { db, seedOnce } from "@/mocks/db";
import {
  calculateAgeInMonths,
  formatPediatricAge,
  isTargetPediatricAge,
} from "@/lib/pediatricAge";
import {
  getBloodPressureRangeByAgeMonths,
  getPediatricVitalRanges,
} from "@/lib/pediatricVitals";
import {
  useConsultationStore,
  type ClinicalFormState,
} from "@/store/useConsultationStore";

seedOnce();

type MultiValueInput = string[] | string | null | undefined;

const LEGACY_MULTI_FIELDS = [
  "alarmSigns",
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
const INFORMANT_OPTIONS = ["MADRE", "PADRE", "CUIDADOR", "OTRO"] as const;
const PREMATURITY_OPTIONS = ["SI", "NO", "DESCONOCIDO"] as const;
const BILATERAL_EDEMA_GRADE_OPTIONS = ["0", "+", "++", "+++"] as const;
const ALARM_SIGN_OPTIONS = [
  "FIEBRE PERSISTENTE",
  "RECHAZO TOTAL DE ALIMENTOS",
  "VOMITOS REPETIDOS",
  "LETARGIA",
  "DIARREA CON SANGRE",
  "DIFICULTAD RESPIRATORIA",
  "CONVULSIONES",
  "NINGUNA",
] as const;

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
  const vitalRanges = useMemo(
    () => getPediatricVitalRanges(selectedPatientAgeMonths),
    [selectedPatientAgeMonths]
  );
  const bloodPressureRanges = useMemo(
    () => getBloodPressureRangeByAgeMonths(selectedPatientAgeMonths),
    [selectedPatientAgeMonths]
  );
  const bloodPressureRaw = clinical.bloodPressure;
  const bloodPressureSystolic = clinical.bloodPressureSystolic;
  const bloodPressureDiastolic = clinical.bloodPressureDiastolic;

  const alarmSignsValues = normalizeMultiValues(clinical.alarmSigns as MultiValueInput);
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
    if (!isFormEnabled) return;
    setClinical(toFieldPatch(field, value));
  };

  const setBloodPressureValues = (
    systolic?: number,
    diastolic?: number
  ) => {
    if (!isFormEnabled) return;

    const formatted =
      systolic !== undefined && diastolic !== undefined
        ? `${systolic}/${diastolic}`
        : undefined;

    setClinical({
      bloodPressureSystolic: systolic,
      bloodPressureDiastolic: diastolic,
      bloodPressure: formatted,
    });
  };

  const handleVitalInput = (field: VitalField, rawValue: string) => {
    if (!isFormEnabled) return;

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

  const handleIntegerInput = <
    K extends "birthWeightKg" | "gestationalAgeWeeks",
  >(
    field: K,
    rawValue: string
  ) => {
    if (!isFormEnabled) return;

    const trimmed = rawValue.trim();
    if (!trimmed) {
      setField(field, undefined as ClinicalFormState[K]);
      return;
    }

    const normalized = trimmed.replace(",", ".");
    const value = Number(normalized);
    if (Number.isNaN(value)) return;
    if (field === "gestationalAgeWeeks" && !Number.isInteger(value)) return;

    setField(field, value as ClinicalFormState[K]);
  };

  const handleBloodPressureInput = (
    field: "bloodPressureSystolic" | "bloodPressureDiastolic",
    rawValue: string
  ) => {
    if (!isFormEnabled) return;

    const trimmed = rawValue.trim();
    const parsedValue = trimmed ? Number.parseInt(trimmed, 10) : undefined;
    if (trimmed && Number.isNaN(parsedValue)) return;

    const nextSystolic =
      field === "bloodPressureSystolic" ? parsedValue : clinical.bloodPressureSystolic;
    const nextDiastolic =
      field === "bloodPressureDiastolic" ? parsedValue : clinical.bloodPressureDiastolic;

    setBloodPressureValues(nextSystolic, nextDiastolic);
  };

  const temperatureError =
    clinical.temperatureCelsius !== undefined
      ? validateRange(
          clinical.temperatureCelsius,
          vitalRanges.temperature.min,
          vitalRanges.temperature.max,
          "Temperatura"
        )
      : null;
  const heartRateError =
    clinical.heartRate !== undefined
      ? validateRange(
          clinical.heartRate,
          vitalRanges.heartRate.min,
          vitalRanges.heartRate.max,
          "Frecuencia cardiaca"
        )
      : null;
  const respiratoryRateError =
    clinical.respiratoryRate !== undefined
      ? validateRange(
          clinical.respiratoryRate,
          vitalRanges.respiratoryRate.min,
          vitalRanges.respiratoryRate.max,
          "Frecuencia respiratoria"
        )
      : null;

  const birthWeightError =
    clinical.birthWeightKg !== undefined
      ? validateRange(clinical.birthWeightKg, 0.5, 6.5, "Peso al nacer")
      : null;
  const gestationalAgeError =
    clinical.gestationalAgeWeeks !== undefined
      ? validateRange(clinical.gestationalAgeWeeks, 24, 44, "Edad gestacional")
      : null;

  const isSystolicProvided = clinical.bloodPressureSystolic !== undefined;
  const isDiastolicProvided = clinical.bloodPressureDiastolic !== undefined;
  const bloodPressurePairError =
    isSystolicProvided !== isDiastolicProvided
      ? "Completa sistolica y diastolica para registrar la presion arterial."
      : null;

  const bloodPressureSystolicError =
    clinical.bloodPressureSystolic !== undefined
      ? validateRange(
          clinical.bloodPressureSystolic,
          bloodPressureRanges.systolic.min,
          bloodPressureRanges.systolic.max,
          "Presion sistolica"
        )
      : null;
  const bloodPressureDiastolicError =
    clinical.bloodPressureDiastolic !== undefined
      ? validateRange(
          clinical.bloodPressureDiastolic,
          bloodPressureRanges.diastolic.min,
          bloodPressureRanges.diastolic.max,
          "Presion diastolica"
        )
      : null;
  const bloodPressureOrderError =
    clinical.bloodPressureSystolic !== undefined &&
    clinical.bloodPressureDiastolic !== undefined &&
    clinical.bloodPressureSystolic <= clinical.bloodPressureDiastolic
      ? "La sistolica debe ser mayor que la diastolica."
      : null;

  const mainReasonError = clinical.mainConsultationReason?.trim()
    ? null
    : "Motivo principal de consulta es obligatorio.";
  const informantNameError = clinical.informantName?.trim()
    ? null
    : "Nombre del informante es obligatorio.";
  const informantRelationshipError = clinical.informantRelationship?.trim()
    ? null
    : "Parentesco del informante es obligatorio.";

  const isInformantComplete = Boolean(
    clinical.informantType &&
      clinical.informantName?.trim() &&
      clinical.informantRelationship?.trim()
  );

  const isGeneralComplete = Boolean(
    activityValues.length &&
      apathyValues.length &&
      alarmSignsValues.length &&
      clinical.mainConsultationReason?.trim() &&
      isInformantComplete &&
      !birthWeightError &&
      !gestationalAgeError
  );

  const isPhysicalComplete = Boolean(
    hairValues.length &&
      skinValues.length &&
      edemaValues.length &&
      clinical.bilateralEdemaGrade &&
      dentitionValues.length
  );

  const isDigestiveComplete = Boolean(
    clinical.diarrhea && clinical.vomiting && dehydrationValues.length
  );

  const isBloodPressureValid =
    !bloodPressurePairError &&
    !bloodPressureSystolicError &&
    !bloodPressureDiastolicError &&
    !bloodPressureOrderError;

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
    isFormEnabled &&
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

  useEffect(() => {
    if (!isFormEnabled) return;

    if (
      bloodPressureSystolic !== undefined ||
      bloodPressureDiastolic !== undefined
    ) {
      const formatted =
        bloodPressureSystolic !== undefined && bloodPressureDiastolic !== undefined
          ? `${bloodPressureSystolic}/${bloodPressureDiastolic}`
          : undefined;

      if ((bloodPressureRaw ?? "") !== (formatted ?? "")) {
        setClinical({ bloodPressure: formatted });
      }

      return;
    }

    const legacyValue = bloodPressureRaw?.trim();
    if (!legacyValue) return;

    const legacyMatch = legacyValue.match(/^(\d{2,3})\/(\d{2,3})$/);
    if (!legacyMatch) return;

    const parsedSystolic = Number.parseInt(legacyMatch[1], 10);
    const parsedDiastolic = Number.parseInt(legacyMatch[2], 10);
    if (Number.isNaN(parsedSystolic) || Number.isNaN(parsedDiastolic)) return;

    setClinical({
      bloodPressureSystolic: parsedSystolic,
      bloodPressureDiastolic: parsedDiastolic,
    });
  }, [
    bloodPressureRaw,
    bloodPressureSystolic,
    bloodPressureDiastolic,
    isFormEnabled,
    setClinical,
  ]);

  const maxUnlockedStep = useMemo(() => {
    if (!isFormEnabled) return 0;
    if (!isGeneralComplete) return 0;
    if (!isPhysicalComplete) return 1;
    if (!isDigestiveComplete) return 2;
    return 3;
  }, [isFormEnabled, isGeneralComplete, isPhysicalComplete, isDigestiveComplete]);

  const currentStep = Math.min(rawStep, maxUnlockedStep);
  const canGoBack = currentStep > 0;
  const canShowNext = currentStep < CLINICAL_STEPS.length - 1;
  const canGoNext = currentStep < maxUnlockedStep;

  return (
    <section className="space-y-6 rounded-xl bg-nutri-white p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-nutri-primary">Datos Clinicos</h3>

      {!isPatientSelected && (
        <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white px-4 py-3 text-sm text-nutri-dark-grey">
          Selecciona un paciente para registrar sus datos clinicos.
        </p>
      )}
      {isPatientSelected && !isTargetAgeSelected && (
        <p className="rounded-lg border border-nutri-secondary/40 bg-nutri-off-white px-4 py-3 text-sm text-nutri-dark-grey">
          El registro clinico esta parametrizado para pacientes de 6 meses a 5 anios. Edad del
          paciente seleccionado:{" "}
          {selectedPatientAgeMonths !== null
            ? formatPediatricAge(selectedPatientAgeMonths)
            : "Sin dato"}.
        </p>
      )}

      <div className={cn("space-y-5", !isFormEnabled && "opacity-60")}>
        <header className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-4 py-3">
          <p className="text-sm font-semibold text-nutri-dark-grey">
            {CLINICAL_STEPS[currentStep].title}
          </p>
        </header>

        {currentStep === 0 && (
          <div className="space-y-6 rounded-lg border border-nutri-dark-grey/40 bg-nutri-white p-4 sm:p-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-nutri-dark-grey">
                Motivo principal de consulta
              </label>
              <input
                type="text"
                maxLength={140}
                disabled={!isFormEnabled}
                value={clinical.mainConsultationReason ?? ""}
                onChange={(event) =>
                  setField("mainConsultationReason", event.target.value)
                }
                className={cn("nutri-input", mainReasonError && "border-nutri-secondary")}
                placeholder="Ej: Poca ganancia de peso en el ultimo mes"
              />
              {mainReasonError && (
                <p className="text-xs font-medium text-nutri-secondary">{mainReasonError}</p>
              )}
            </div>

            <SingleSelectOptionGroup
              label="Quien brinda la informacion"
              value={clinical.informantType}
              options={INFORMANT_OPTIONS}
              columnsClassName="grid-cols-2 lg:grid-cols-4"
              disabled={!isFormEnabled}
              onChange={(value) =>
                setField("informantType", value as ClinicalFormState["informantType"])
              }
            />
            {!clinical.informantType && (
              <p className="text-xs font-medium text-nutri-secondary">
                Selecciona quien brinda la informacion.
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-nutri-dark-grey">
                  Nombre de quien brinda la informacion
                </label>
                <input
                  type="text"
                  disabled={!isFormEnabled}
                  value={clinical.informantName ?? ""}
                  onChange={(event) => setField("informantName", event.target.value)}
                  className={cn(
                    "nutri-input",
                    informantNameError && "border-nutri-secondary"
                  )}
                  placeholder="Nombre completo"
                />
                {informantNameError && (
                  <p className="text-xs font-medium text-nutri-secondary">
                    {informantNameError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-nutri-dark-grey">
                  Parentesco
                </label>
                <input
                  type="text"
                  disabled={!isFormEnabled}
                  value={clinical.informantRelationship ?? ""}
                  onChange={(event) =>
                    setField("informantRelationship", event.target.value)
                  }
                  className={cn(
                    "nutri-input",
                    informantRelationshipError && "border-nutri-secondary"
                  )}
                  placeholder="Ej: madre, padre, tia, cuidador"
                />
                {informantRelationshipError && (
                  <p className="text-xs font-medium text-nutri-secondary">
                    {informantRelationshipError}
                  </p>
                )}
              </div>
            </div>

            <MultiSelectOptionGroup
              label="Senales de alarma actuales"
              values={alarmSignsValues}
              options={ALARM_SIGN_OPTIONS}
              exclusiveOptions={["NINGUNA"]}
              columnsClassName="grid-cols-1 sm:grid-cols-2"
              disabled={!isFormEnabled}
              onChange={(value) => setField("alarmSigns", value)}
            />
            {!alarmSignsValues.length && (
              <p className="text-xs font-medium text-nutri-secondary">
                Selecciona al menos una opcion (puedes usar NINGUNA).
              </p>
            )}

            <div className="space-y-4 rounded-lg border border-nutri-light-grey bg-nutri-off-white/40 p-3">
              <p className="text-sm font-semibold text-nutri-dark-grey">
                Antecedentes perinatales
              </p>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-nutri-dark-grey">
                    Peso al nacer (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0.5}
                    max={6.5}
                    disabled={!isFormEnabled}
                    value={clinical.birthWeightKg ?? ""}
                    onChange={(event) =>
                      handleIntegerInput("birthWeightKg", event.target.value)
                    }
                    className={cn("nutri-input", birthWeightError && "border-nutri-secondary")}
                    placeholder="Opcional"
                  />
                  {birthWeightError && (
                    <p className="text-xs font-medium text-nutri-secondary">
                      {birthWeightError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-nutri-dark-grey">
                    Edad gestacional al nacer (semanas)
                  </label>
                  <input
                    type="number"
                    step={1}
                    min={24}
                    max={44}
                    disabled={!isFormEnabled}
                    value={clinical.gestationalAgeWeeks ?? ""}
                    onChange={(event) =>
                      handleIntegerInput("gestationalAgeWeeks", event.target.value)
                    }
                    className={cn(
                      "nutri-input",
                      gestationalAgeError && "border-nutri-secondary"
                    )}
                    placeholder="Opcional"
                  />
                  {gestationalAgeError && (
                    <p className="text-xs font-medium text-nutri-secondary">
                      {gestationalAgeError}
                    </p>
                  )}
                </div>
              </div>

              <SingleSelectOptionGroup
                label="Prematuridad"
                value={clinical.prematurity}
                options={PREMATURITY_OPTIONS}
                columnsClassName="grid-cols-1 sm:grid-cols-3"
                disabled={!isFormEnabled}
                onChange={(value) =>
                  setField("prematurity", value as ClinicalFormState["prematurity"])
                }
              />
            </div>

            <MultiSelectOptionGroup
              label="Nivel de actividad"
              values={activityValues}
              options={ACTIVITY_OPTIONS}
              exclusiveOptions={["INACTIVO"]}
              disabled={!isFormEnabled}
              onChange={(value) => setField("activityLevel", value)}
            />

            <MultiSelectOptionGroup
              label="Presencia de desanimo"
              values={apathyValues}
              options={MOOD_OPTIONS}
              exclusiveOptions={["NORMAL"]}
              disabled={!isFormEnabled}
              onChange={(value) => setField("apathy", value)}
            />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-nutri-dark-grey">Observaciones</label>
              <textarea
                rows={3}
                disabled={!isFormEnabled}
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
            <MultiSelectOptionGroup
              label="Cabello"
              values={hairValues}
              options={HAIR_OPTIONS}
              exclusiveOptions={["NORMAL"]}
              disabled={!isFormEnabled}
              onChange={(value) => setField("hairCondition", value)}
            />

            <MultiSelectOptionGroup
              label="Piel"
              values={skinValues}
              options={SKIN_OPTIONS}
              exclusiveOptions={["NORMAL"]}
              disabled={!isFormEnabled}
              onChange={(value) => setField("skinCondition", value)}
            />

            <MultiSelectOptionGroup
              label="Edema"
              values={edemaValues}
              options={EDEMA_OPTIONS}
              exclusiveOptions={["NO PRESENTA"]}
              disabled={!isFormEnabled}
              onChange={(value) => setField("edema", value)}
            />

            <SingleSelectOptionGroup
              label="Edema bilateral con grado"
              value={clinical.bilateralEdemaGrade}
              options={BILATERAL_EDEMA_GRADE_OPTIONS}
              columnsClassName="grid-cols-2 sm:grid-cols-4"
              disabled={!isFormEnabled}
              onChange={(value) =>
                setField(
                  "bilateralEdemaGrade",
                  value as ClinicalFormState["bilateralEdemaGrade"]
                )
              }
            />

            <MultiSelectOptionGroup
              label="Denticion y sistema oseo"
              values={dentitionValues}
              options={DENTITION_OPTIONS}
              exclusiveOptions={["NORMAL"]}
              disabled={!isFormEnabled}
              onChange={(value) => setField("dentition", value)}
            />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-nutri-dark-grey">Observaciones</label>
              <textarea
                rows={3}
                disabled={!isFormEnabled}
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
            <SingleSelectOptionGroup
              label="Presencia de diarrea"
              value={clinical.diarrhea}
              options={YES_NO_OPTIONS}
              columnsClassName="grid-cols-2 sm:grid-cols-4"
              disabled={!isFormEnabled}
              onChange={(value) => setField("diarrhea", value)}
            />

            <SingleSelectOptionGroup
              label="Presencia de vomitos"
              value={clinical.vomiting}
              options={YES_NO_OPTIONS}
              columnsClassName="grid-cols-2 sm:grid-cols-4"
              disabled={!isFormEnabled}
              onChange={(value) => setField("vomiting", value)}
            />

            <MultiSelectOptionGroup
              label="Signos de deshidratacion"
              values={dehydrationValues}
              options={DEHYDRATION_OPTIONS}
              exclusiveOptions={["NO PRESENTA"]}
              disabled={!isFormEnabled}
              onChange={(value) => setField("dehydration", value)}
            />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-nutri-dark-grey">Observaciones</label>
              <textarea
                rows={3}
                disabled={!isFormEnabled}
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
                  disabled={!isFormEnabled}
                  value={clinical.temperatureCelsius ?? ""}
                  onChange={(event) => handleVitalInput("temperatureCelsius", event.target.value)}
                  className={cn("nutri-input", temperatureError && "border-nutri-secondary")}
                  placeholder={`Rango pediatrico esperado: ${vitalRanges.temperature.min.toFixed(
                    1
                  )} a ${vitalRanges.temperature.max.toFixed(1)} C`}
                />
                {temperatureError && (
                  <p className="text-xs font-medium text-nutri-secondary">{temperatureError}</p>
                )}
              </div>
              <input
                type="text"
                disabled={!isFormEnabled}
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
                  disabled={!isFormEnabled}
                  value={clinical.heartRate ?? ""}
                  onChange={(event) => handleVitalInput("heartRate", event.target.value)}
                  className={cn("nutri-input", heartRateError && "border-nutri-secondary")}
                  placeholder={`Rango pediatrico esperado: ${vitalRanges.heartRate.min} a ${vitalRanges.heartRate.max} lpm`}
                />
                {heartRateError && (
                  <p className="text-xs font-medium text-nutri-secondary">{heartRateError}</p>
                )}
              </div>
              <input
                type="text"
                disabled={!isFormEnabled}
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
                  disabled={!isFormEnabled}
                  value={clinical.respiratoryRate ?? ""}
                  onChange={(event) => handleVitalInput("respiratoryRate", event.target.value)}
                  className={cn("nutri-input", respiratoryRateError && "border-nutri-secondary")}
                  placeholder={`Rango pediatrico esperado: ${vitalRanges.respiratoryRate.min} a ${vitalRanges.respiratoryRate.max} rpm`}
                />
                {respiratoryRateError && (
                  <p className="text-xs font-medium text-nutri-secondary">
                    {respiratoryRateError}
                  </p>
                )}
              </div>
              <input
                type="text"
                disabled={!isFormEnabled}
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
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    type="number"
                    min={bloodPressureRanges.systolic.min}
                    max={bloodPressureRanges.systolic.max}
                    step={1}
                    disabled={!isFormEnabled}
                    value={clinical.bloodPressureSystolic ?? ""}
                    onChange={(event) =>
                      handleBloodPressureInput("bloodPressureSystolic", event.target.value)
                    }
                    className={cn(
                      "nutri-input",
                      (bloodPressureSystolicError || bloodPressurePairError) &&
                        "border-nutri-secondary"
                    )}
                    placeholder={`Sistolica (${bloodPressureRanges.systolic.min}-${bloodPressureRanges.systolic.max})`}
                  />
                  <input
                    type="number"
                    min={bloodPressureRanges.diastolic.min}
                    max={bloodPressureRanges.diastolic.max}
                    step={1}
                    disabled={!isFormEnabled}
                    value={clinical.bloodPressureDiastolic ?? ""}
                    onChange={(event) =>
                      handleBloodPressureInput("bloodPressureDiastolic", event.target.value)
                    }
                    className={cn(
                      "nutri-input",
                      (bloodPressureDiastolicError || bloodPressurePairError) &&
                        "border-nutri-secondary"
                    )}
                    placeholder={`Diastolica (${bloodPressureRanges.diastolic.min}-${bloodPressureRanges.diastolic.max})`}
                  />
                </div>
                <p className="text-xs text-nutri-dark-grey/80">
                  Referencia por edad: {bloodPressureRanges.ageGroup}. Campo opcional.
                </p>
                {(bloodPressurePairError ||
                  bloodPressureSystolicError ||
                  bloodPressureDiastolicError ||
                  bloodPressureOrderError) && (
                  <p className="text-xs font-medium text-nutri-secondary">
                    {bloodPressurePairError ??
                      bloodPressureSystolicError ??
                      bloodPressureDiastolicError ??
                      bloodPressureOrderError}
                  </p>
                )}
              </div>
              <input
                type="text"
                disabled={!isFormEnabled}
                value={clinical.bloodPressureObservation ?? ""}
                onChange={(event) => setField("bloodPressureObservation", event.target.value)}
                className="nutri-input"
                placeholder="Observaciones"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div>
            {canGoBack && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Punto anterior
              </Button>
            )}
          </div>
          <div>
            {canShowNext && (
              <Button
                variant="outline"
                disabled={!isFormEnabled || !canGoNext}
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Punto siguiente
              </Button>
            )}
          </div>
        </div>

        <StepDots
          steps={CLINICAL_STEPS}
          currentStep={currentStep}
          maxUnlockedStep={maxUnlockedStep}
          disabled={!isFormEnabled}
          onStepChange={setCurrentStep}
        />
      </div>
    </section>
  );
};

