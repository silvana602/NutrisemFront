"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { validateRange } from "@/utils/validators";
import {
  useConsultationStore,
  type HistoricalFoodFrequency,
  type HistoricalFoodGroupId,
  type HistoricalMealSlotId,
  type HistoricalFormState,
} from "@/store/useConsultationStore";
import { MultiSelectOptionGroup, SingleSelectOptionGroup } from "./shared/OptionGroups";
import { StepDots } from "./shared/StepDots";

const HISTORICAL_STEPS = [
  { id: "feeding", title: "3.1 Alimentacion actual y pasada" },
  { id: "practices", title: "3.2 Practicas alimentarias" },
  { id: "health", title: "3.3 Antecedentes de salud" },
  { id: "sleep", title: "3.4 Patrones de sueno" },
] as const;

const BREASTFEEDING_OPTIONS = [
  "EXCLUSIVA (SOLO LACTANCIA MATERNA)",
  "PARCIAL (LECHE MATERNA + OTROS ALIMENTOS)",
  "NO RECIBIO LACTANCIA",
] as const;

const YES_NO_OPTIONS = ["SI", "NO"] as const;
const MEALS_PER_DAY_OPTIONS = ["1-2", "3", "4 O MAS"] as const;
const APPETITE_OPTIONS = ["BAJO", "NORMAL", "ALTO"] as const;
const RECENT_ILLNESSES_OPTIONS = [
  "INFECCIONES RESPIRATORIAS",
  "DIARREAS FRECUENTES",
  "PARASITOSIS",
  "NINGUNA",
  "OTROS",
] as const;
const VACCINATION_OPTIONS = ["COMPLETO", "INCOMPLETO", "DESCONOCIDO"] as const;
const SLEEP_QUALITY_OPTIONS = [
  "BUENA (DESCANSA BIEN, SIN DESPERTARES FRECUENTES)",
  "REGULAR (SE DESPIERTA VARIAS VECES)",
  "MALA (DIFICULTAD PARA DORMIR O SUENO INTERRUMPIDO)",
] as const;

const MEAL_SLOTS: readonly { id: HistoricalMealSlotId; label: string }[] = [
  { id: "breakfast", label: "Desayuno" },
  { id: "midMorningSnack", label: "Media manana" },
  { id: "lunch", label: "Almuerzo" },
  { id: "afternoonSnack", label: "Merienda" },
  { id: "dinner", label: "Cena" },
  { id: "nightSnack", label: "Colacion nocturna" },
];

const SUGGESTED_SCHEDULE: Record<HistoricalMealSlotId, string> = {
  breakfast: "08:00",
  midMorningSnack: "10:30",
  lunch: "12:30",
  afternoonSnack: "16:30",
  dinner: "19:00",
  nightSnack: "21:00",
};

const FREQUENCY_OPTIONS: readonly HistoricalFoodFrequency[] = [
  "DIARIO",
  "3-4 VECES/SEMANA",
  "1-2 VECES/SEMANA",
  "RARA VEZ / NUNCA",
];

const FOOD_GROUPS: readonly { id: HistoricalFoodGroupId; label: string }[] = [
  { id: "cerealsTubers", label: "CEREALES / TUBERCULOS" },
  { id: "fruits", label: "FRUTAS" },
  { id: "vegetables", label: "VERDURAS" },
  { id: "dairy", label: "LACTEOS" },
  { id: "meatsProteins", label: "CARNES / PROTEINAS" },
  { id: "legumes", label: "LEGUMBRES" },
  { id: "eggs", label: "HUEVOS" },
  { id: "fishSeafood", label: "PESCADOS Y MARISCOS" },
  { id: "ultraProcessed", label: "ALIMENTOS ULTRAPROCESADOS / SNACKS" },
  { id: "fastFoodFried", label: "COMIDA RAPIDA / FRITURAS" },
  { id: "water", label: "AGUA SIMPLE" },
  { id: "sugaryDrinks", label: "BEBIDAS AZUCARADAS" },
];

function toFieldPatch<K extends keyof HistoricalFormState>(
  field: K,
  value: HistoricalFormState[K]
): Partial<HistoricalFormState> {
  return { [field]: value } as Partial<HistoricalFormState>;
}

export const HistoricalForm = () => {
  const {
    selectedPatientId,
    historical,
    setHistorical,
    setHistoricalValidity,
  } = useConsultationStore();

  const isPatientSelected = Boolean(selectedPatientId);
  const stepKey = selectedPatientId ?? "__no-patient__";
  const [stepByPatient, setStepByPatient] = useState<Record<string, number>>({});
  const rawStep = stepByPatient[stepKey] ?? 0;
  const foodFrequencyByGroup = historical.foodFrequencyByGroup ?? {};
  const mealSchedule = historical.mealSchedule ?? {};
  const recentIllnesses = useMemo(
    () => historical.recentIllnesses ?? [],
    [historical.recentIllnesses]
  );

  const setCurrentStep = (step: number) => {
    setStepByPatient((prev) => ({
      ...prev,
      [stepKey]: Math.max(0, Math.min(step, HISTORICAL_STEPS.length - 1)),
    }));
  };

  const setField = <K extends keyof HistoricalFormState>(
    field: K,
    value: HistoricalFormState[K]
  ) => {
    if (!isPatientSelected) return;
    setHistorical(toFieldPatch(field, value));
  };

  const handleComplementaryAgeInput = (rawValue: string) => {
    if (!isPatientSelected) return;

    const trimmed = rawValue.trim();
    if (!trimmed) {
      setField("complementaryFeedingStartMonths", undefined);
      return;
    }

    const value = Number.parseInt(trimmed, 10);
    if (Number.isNaN(value)) return;
    setField("complementaryFeedingStartMonths", value);
  };

  const setFoodFrequency = (groupId: HistoricalFoodGroupId, value?: HistoricalFoodFrequency) => {
    if (!isPatientSelected) return;

    const nextMap = { ...foodFrequencyByGroup };
    if (value) {
      nextMap[groupId] = value;
    } else {
      delete nextMap[groupId];
    }

    setField("foodFrequencyByGroup", nextMap);
  };

  const setMealTime = (slotId: HistoricalMealSlotId, value: string) => {
    if (!isPatientSelected) return;

    const nextSchedule = { ...mealSchedule };
    if (value) {
      nextSchedule[slotId] = value;
    } else {
      delete nextSchedule[slotId];
    }

    setField("mealSchedule", nextSchedule);
  };

  const applySuggestedSchedule = () => {
    if (!isPatientSelected) return;
    setField("mealSchedule", { ...SUGGESTED_SCHEDULE });
  };

  const handleWaterInput = (rawValue: string) => {
    if (!isPatientSelected) return;

    const trimmed = rawValue.trim();
    if (!trimmed) {
      setField("waterGlassesPerDay", undefined);
      return;
    }

    const value = Number.parseInt(trimmed, 10);
    if (Number.isNaN(value)) return;
    setField("waterGlassesPerDay", value);
  };

  const handleSleepAverageInput = (rawValue: string) => {
    if (!isPatientSelected) return;

    const trimmed = rawValue.trim();
    if (!trimmed) {
      setField("sleepAverageHours", undefined);
      return;
    }

    const normalized = trimmed.replace(",", ".");
    const value = Number.parseFloat(normalized);
    if (Number.isNaN(value)) return;
    setField("sleepAverageHours", value);
  };

  const complementaryAgeError =
    historical.complementaryFeedingStartMonths !== undefined
      ? validateRange(
          historical.complementaryFeedingStartMonths,
          0,
          36,
          "Edad de inicio de alimentacion complementaria"
        )
      : null;

  const waterGlassesError =
    historical.waterGlassesPerDay !== undefined
      ? validateRange(historical.waterGlassesPerDay, 0, 20, "Vasos de agua")
      : null;

  const sleepAverageError =
    historical.sleepAverageHours !== undefined
      ? validateRange(historical.sleepAverageHours, 0, 24, "Horas promedio de sueno")
      : null;

  const mealEntries = MEAL_SLOTS.filter((slot) => Boolean(mealSchedule[slot.id]));
  const habitualScheduleValue = mealEntries
    .map((slot) => `${slot.label} ${mealSchedule[slot.id]}`)
    .join(" - ");

  useEffect(() => {
    if (!isPatientSelected) return;
    if (historical.bottleFeeding === "SI") return;
    if (!historical.feedingFrequency) return;

    setHistorical({ feedingFrequency: "" });
  }, [
    historical.bottleFeeding,
    historical.feedingFrequency,
    isPatientSelected,
    setHistorical,
  ]);

  useEffect(() => {
    if (!isPatientSelected) return;
    if (recentIllnesses.includes("OTROS")) return;
    if (!historical.recentIllnessesOther) return;

    setHistorical({ recentIllnessesOther: "" });
  }, [
    recentIllnesses,
    historical.recentIllnessesOther,
    isPatientSelected,
    setHistorical,
  ]);

  useEffect(() => {
    if (!isPatientSelected) return;
    if ((historical.habitualSchedule ?? "") === habitualScheduleValue) return;
    setHistorical({ habitualSchedule: habitualScheduleValue });
  }, [historical.habitualSchedule, habitualScheduleValue, isPatientSelected, setHistorical]);

  const isBottleFrequencyComplete =
    historical.bottleFeeding !== "SI" || Boolean(historical.feedingFrequency?.trim());

  const isStepOneComplete = Boolean(
    historical.breastfeeding &&
      historical.bottleFeeding &&
      historical.complementaryFeedingStartMonths !== undefined &&
      !complementaryAgeError &&
      isBottleFrequencyComplete
  );

  const isFoodMatrixComplete = FOOD_GROUPS.every((group) =>
    Boolean(foodFrequencyByGroup[group.id])
  );

  const minimumMealsBySelection: Record<NonNullable<HistoricalFormState["mealsPerDay"]>, number> =
    {
      "1-2": 2,
      "3": 3,
      "4 O MAS": 4,
    };

  const selectedMealsCount = mealEntries.length;
  const requiredMealsCount = historical.mealsPerDay
    ? minimumMealsBySelection[historical.mealsPerDay]
    : null;
  const isMealScheduleComplete = Boolean(
    requiredMealsCount && selectedMealsCount >= requiredMealsCount
  );
  const mealScheduleError =
    historical.mealsPerDay && !isMealScheduleComplete
      ? `Completa al menos ${requiredMealsCount} horarios segun la cantidad de comidas.`
      : null;

  const isStepTwoComplete = Boolean(
    isFoodMatrixComplete &&
      historical.mealsPerDay &&
      isMealScheduleComplete &&
      historical.appetiteLevel &&
      historical.waterGlassesPerDay !== undefined &&
      !waterGlassesError
  );

  const hasOtherIllnessSelected = recentIllnesses.includes("OTROS");
  const isRecentIllnessesComplete = Boolean(
    recentIllnesses.length &&
      (!hasOtherIllnessSelected || Boolean(historical.recentIllnessesOther?.trim()))
  );
  const recentIllnessesError = !isRecentIllnessesComplete
    ? hasOtherIllnessSelected
      ? "Describe la enfermedad en el campo OTROS."
      : "Selecciona al menos una opcion de enfermedades recientes."
    : null;

  const isStepThreeComplete = Boolean(
    isRecentIllnessesComplete && historical.vaccinationStatus
  );

  const isStepFourComplete = Boolean(
    historical.sleepAverageHours !== undefined &&
      !sleepAverageError &&
      historical.sleepQuality &&
      historical.bedtime &&
      historical.wakeupTime
  );

  useEffect(() => {
    setHistoricalValidity(
      isPatientSelected &&
        isStepOneComplete &&
        isStepTwoComplete &&
        isStepThreeComplete &&
        isStepFourComplete
    );
  }, [
    isPatientSelected,
    isStepOneComplete,
    isStepTwoComplete,
    isStepThreeComplete,
    isStepFourComplete,
    setHistoricalValidity,
  ]);

  const maxUnlockedStep = useMemo(() => {
    if (!isPatientSelected) return 0;
    if (!isStepOneComplete) return 0;
    if (!isStepTwoComplete) return 1;
    if (!isStepThreeComplete) return 2;
    if (!isStepFourComplete) return 3;
    return 3;
  }, [
    isPatientSelected,
    isStepOneComplete,
    isStepTwoComplete,
    isStepThreeComplete,
    isStepFourComplete,
  ]);

  const currentStep = Math.min(rawStep, maxUnlockedStep);
  const canGoBack = currentStep > 0;
  const canShowNext = currentStep < HISTORICAL_STEPS.length - 1;
  const canGoNext = currentStep < maxUnlockedStep;
  return (
    <section className="space-y-6 rounded-xl bg-nutri-white p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-nutri-primary">Datos Historicos</h3>

      {!isPatientSelected && (
        <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white px-4 py-3 text-sm text-nutri-dark-grey">
          Selecciona un paciente para registrar sus datos historicos.
        </p>
      )}

      <div className={cn("space-y-5", !isPatientSelected && "opacity-60")}>
        <header className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/70 px-4 py-3">
          <p className="text-sm font-semibold text-nutri-dark-grey">
            {HISTORICAL_STEPS[currentStep].title}
          </p>
        </header>

        {currentStep === 0 && (
          <div className="space-y-6 rounded-lg border border-nutri-dark-grey/40 bg-nutri-white p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-5">
                <SingleSelectOptionGroup
                  label="Lactancia materna"
                  value={historical.breastfeeding}
                  options={BREASTFEEDING_OPTIONS}
                  columnsClassName="grid-cols-1"
                  disabled={!isPatientSelected}
                  onChange={(value) => setField("breastfeeding", value)}
                />

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-nutri-dark-grey">
                    Edad de inicio de la alimentacion complementaria
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={36}
                    step={1}
                    disabled={!isPatientSelected}
                    value={historical.complementaryFeedingStartMonths ?? ""}
                    onChange={(event) => handleComplementaryAgeInput(event.target.value)}
                    className={cn(
                      "nutri-input",
                      complementaryAgeError && "border-nutri-secondary"
                    )}
                    placeholder="Edad en meses"
                  />
                  {complementaryAgeError && (
                    <p className="text-xs font-medium text-nutri-secondary">
                      {complementaryAgeError}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <SingleSelectOptionGroup
                  label="Uso de biberones o mamaderas"
                  value={historical.bottleFeeding}
                  options={YES_NO_OPTIONS}
                  columnsClassName="grid-cols-1 sm:grid-cols-2"
                  disabled={!isPatientSelected}
                  onChange={(value) => setField("bottleFeeding", value)}
                />

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-nutri-dark-grey">
                    En caso de afirmativo, frecuencia
                  </label>
                  <input
                    type="text"
                    disabled={!isPatientSelected || historical.bottleFeeding !== "SI"}
                    value={historical.feedingFrequency ?? ""}
                    onChange={(event) => setField("feedingFrequency", event.target.value)}
                    className="nutri-input"
                    placeholder="Ej: 1 vez al dia, con leche antes de dormir"
                  />
                  {historical.bottleFeeding === "SI" && !isBottleFrequencyComplete && (
                    <p className="text-xs font-medium text-nutri-secondary">
                      Debes registrar la frecuencia cuando marcas SI.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6 rounded-lg border border-nutri-dark-grey/40 bg-nutri-white p-4 sm:p-5">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-nutri-dark-grey">
                Tipo de alimentos consumidos habitualmente y su frecuencia de consumo
              </p>

              <div className="overflow-x-auto rounded-lg border border-nutri-light-grey bg-nutri-off-white/40 p-3">
                <table className="min-w-[860px] table-auto border-separate border-spacing-y-2 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/80">
                      <th className="w-[340px] px-2 py-1">Tipo de alimento</th>
                      {FREQUENCY_OPTIONS.map((option) => (
                        <th key={option} className="px-2 py-1 text-center">
                          {option}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FOOD_GROUPS.map((group) => {
                      const selected = foodFrequencyByGroup[group.id];

                      return (
                        <tr key={group.id} className="rounded-md bg-nutri-white">
                          <td className="px-2 py-2 font-medium text-nutri-dark-grey">
                            {group.label}
                          </td>
                          {FREQUENCY_OPTIONS.map((option) => {
                            const checked = selected === option;
                            return (
                              <td key={option} className="px-2 py-2 text-center">
                                <label
                                  className={cn(
                                    "inline-flex items-center justify-center rounded-md border px-2 py-1",
                                    checked
                                      ? "border-nutri-primary bg-nutri-primary/10"
                                      : "border-nutri-light-grey bg-nutri-white",
                                    !isPatientSelected && "cursor-not-allowed opacity-60"
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={!isPatientSelected}
                                    onChange={(event) =>
                                      setFoodFrequency(
                                        group.id,
                                        event.target.checked ? option : undefined
                                      )
                                    }
                                    aria-label={`${group.label} - ${option}`}
                                    className="h-4 w-4 rounded border-nutri-light-grey accent-nutri-primary"
                                  />
                                </label>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {!isFoodMatrixComplete && (
                <p className="text-xs font-medium text-nutri-secondary">
                  Selecciona una frecuencia para cada tipo de alimento.
                </p>
              )}
            </div>

            <div className="space-y-6">
              <SingleSelectOptionGroup
                label="Cantidad de comidas al dia"
                value={historical.mealsPerDay}
                options={MEALS_PER_DAY_OPTIONS}
                columnsClassName="grid-cols-3"
                disabled={!isPatientSelected}
                onChange={(value) =>
                  setField("mealsPerDay", value as HistoricalFormState["mealsPerDay"])
                }
              />

              <div className="space-y-3 rounded-lg border border-nutri-light-grey bg-nutri-off-white/40 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="text-sm font-semibold text-nutri-dark-grey">
                    Horarios habituales (seleccion guiada)
                  </label>
                  <button
                    type="button"
                    disabled={!isPatientSelected}
                    onClick={applySuggestedSchedule}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                      "border-nutri-primary/30 bg-nutri-white text-nutri-primary hover:bg-nutri-primary/10",
                      !isPatientSelected && "cursor-not-allowed opacity-60"
                    )}
                  >
                    Aplicar horario sugerido
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {MEAL_SLOTS.map((slot) => (
                    <div key={slot.id} className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/80">
                        {slot.label}
                      </label>
                      <input
                        type="time"
                        disabled={!isPatientSelected}
                        value={mealSchedule[slot.id] ?? ""}
                        onChange={(event) => setMealTime(slot.id, event.target.value)}
                        className="nutri-input"
                      />
                    </div>
                  ))}
                </div>

                {mealScheduleError && (
                  <p className="text-xs font-medium text-nutri-secondary">{mealScheduleError}</p>
                )}

                <p className="text-xs text-nutri-dark-grey/80">
                  Horario generado: {habitualScheduleValue || "Sin horarios cargados"}
                </p>
              </div>

              <SingleSelectOptionGroup
                label="Apetito habitual"
                value={historical.appetiteLevel}
                options={APPETITE_OPTIONS}
                columnsClassName="grid-cols-1 sm:grid-cols-3"
                disabled={!isPatientSelected}
                onChange={(value) =>
                  setField("appetiteLevel", value as HistoricalFormState["appetiteLevel"])
                }
              />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-nutri-dark-grey">
                  Vasos de agua al dia
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={1}
                  disabled={!isPatientSelected}
                  value={historical.waterGlassesPerDay ?? ""}
                  onChange={(event) => handleWaterInput(event.target.value)}
                  className={cn("nutri-input", waterGlassesError && "border-nutri-secondary")}
                  placeholder="Ej: 6"
                />
                {waterGlassesError && (
                  <p className="text-xs font-medium text-nutri-secondary">
                    {waterGlassesError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 rounded-lg border border-nutri-dark-grey/40 bg-nutri-white p-4 sm:p-5">
            <h4 className="text-base font-semibold text-nutri-primary">
              Antecedentes de salud
            </h4>

            <div className="space-y-4">
              <MultiSelectOptionGroup
                label="Enfermedades recientes (ultimos 3 meses)"
                values={recentIllnesses}
                options={RECENT_ILLNESSES_OPTIONS}
                exclusiveOptions={["NINGUNA"]}
                columnsClassName="grid-cols-1"
                disabled={!isPatientSelected}
                onChange={(value) => setField("recentIllnesses", value)}
              />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-nutri-dark-grey">OTROS</label>
                <input
                  type="text"
                  disabled={!isPatientSelected || !hasOtherIllnessSelected}
                  value={historical.recentIllnessesOther ?? ""}
                  onChange={(event) => setField("recentIllnessesOther", event.target.value)}
                  className={cn(
                    "nutri-input",
                    hasOtherIllnessSelected &&
                      !historical.recentIllnessesOther?.trim() &&
                      "border-nutri-secondary"
                  )}
                  placeholder="Especificar otro antecedente"
                />
              </div>

              {recentIllnessesError && (
                <p className="text-xs font-medium text-nutri-secondary">{recentIllnessesError}</p>
              )}
            </div>

            <SingleSelectOptionGroup
              label="Estado de vacunacion"
              value={historical.vaccinationStatus}
              options={VACCINATION_OPTIONS}
              columnsClassName="grid-cols-1 sm:grid-cols-3"
              disabled={!isPatientSelected}
              onChange={(value) =>
                setField(
                  "vaccinationStatus",
                  value as HistoricalFormState["vaccinationStatus"]
                )
              }
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 rounded-lg border border-nutri-dark-grey/40 bg-nutri-white p-4 sm:p-5">
            <h4 className="text-base font-semibold text-nutri-primary">Sueno</h4>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-nutri-dark-grey">
                Horas promedio de sueno por dia
              </label>
              <input
                type="number"
                min={0}
                max={24}
                step="0.5"
                disabled={!isPatientSelected}
                value={historical.sleepAverageHours ?? ""}
                onChange={(event) => handleSleepAverageInput(event.target.value)}
                className={cn("nutri-input max-w-sm", sleepAverageError && "border-nutri-secondary")}
                placeholder="Medida en horas (hrs)"
              />
              {sleepAverageError && (
                <p className="text-xs font-medium text-nutri-secondary">{sleepAverageError}</p>
              )}
            </div>

            <SingleSelectOptionGroup
              label="Calidad de sueno"
              value={historical.sleepQuality}
              options={SLEEP_QUALITY_OPTIONS}
              columnsClassName="grid-cols-1"
              disabled={!isPatientSelected}
              onChange={(value) =>
                setField("sleepQuality", value as HistoricalFormState["sleepQuality"])
              }
            />

            <div className="space-y-3">
              <p className="text-sm font-semibold text-nutri-dark-grey">Rutina de sueno</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
                <label className="text-sm font-medium text-nutri-dark-grey">Hora de acostarse</label>
                <input
                  type="time"
                  disabled={!isPatientSelected}
                  value={historical.bedtime ?? ""}
                  onChange={(event) => setField("bedtime", event.target.value)}
                  className="nutri-input max-w-sm"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
                <label className="text-sm font-medium text-nutri-dark-grey">Hora de levantarse</label>
                <input
                  type="time"
                  disabled={!isPatientSelected}
                  value={historical.wakeupTime ?? ""}
                  onChange={(event) => setField("wakeupTime", event.target.value)}
                  className="nutri-input max-w-sm"
                />
              </div>
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
                disabled={!isPatientSelected || !canGoNext}
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Punto siguiente
              </Button>
            )}
          </div>
        </div>

        <StepDots
          steps={HISTORICAL_STEPS}
          currentStep={currentStep}
          maxUnlockedStep={maxUnlockedStep}
          disabled={!isPatientSelected}
          onStepChange={setCurrentStep}
        />
      </div>
    </section>
  );
};
