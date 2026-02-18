import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ConsultationStep = "anthropometric" | "clinical";

export interface AnthropometricFormState {
  weightKg?: number;
  heightM?: number;
  muacCm?: number;
  headCircumferenceCm?: number;
  bmi?: number;
  zScore?: number;
  percentile?: number;
}

export interface ClinicalFormState {
  ageYears?: number; // legado
  activityLevel?: string[];
  apathy?: string[];
  generalObservations?: string;

  hairCondition?: string[];
  skinCondition?: string[];
  edema?: string[];
  dentition?: string[];
  physicalObservations?: string;

  diarrhea?: string;
  vomiting?: string;
  dehydration?: string[];
  digestiveObservations?: string;

  temperatureCelsius?: number;
  temperatureObservation?: string;
  heartRate?: number;
  heartRateObservation?: string;
  respiratoryRate?: number;
  respiratoryRateObservation?: string;
  bloodPressure?: string;
  bloodPressureObservation?: string;
  observations?: string;
}

export interface HistoricalFormState {
  breastfeeding?: string;
  bottleFeeding?: string;
  feedingFrequency?: string;
  complementaryFeedingStartMonths?: number;
  foodFrequencyByGroup?: Partial<Record<HistoricalFoodGroupId, HistoricalFoodFrequency>>;
  mealsPerDay?: "1-2" | "3" | "4 O MAS";
  mealSchedule?: Partial<Record<HistoricalMealSlotId, string>>;
  habitualSchedule?: string;
  appetiteLevel?: "BAJO" | "NORMAL" | "ALTO";
  waterGlassesPerDay?: number;
  recentIllnesses?: string[];
  recentIllnessesOther?: string;
  vaccinationStatus?: "COMPLETO" | "INCOMPLETO" | "DESCONOCIDO";
  sleepAverageHours?: number;
  sleepQuality?:
    | "BUENA (DESCANSA BIEN, SIN DESPERTARES FRECUENTES)"
    | "REGULAR (SE DESPIERTA VARIAS VECES)"
    | "MALA (DIFICULTAD PARA DORMIR O SUENO INTERRUMPIDO)";
  bedtime?: string;
  wakeupTime?: string;
}

export type HistoricalFoodFrequency =
  | "DIARIO"
  | "3-4 VECES/SEMANA"
  | "1-2 VECES/SEMANA"
  | "RARA VEZ / NUNCA";

export type HistoricalFoodGroupId =
  | "cerealsTubers"
  | "fruits"
  | "vegetables"
  | "dairy"
  | "meatsProteins"
  | "legumes"
  | "ultraProcessed"
  | "eggs"
  | "fishSeafood"
  | "water"
  | "sugaryDrinks"
  | "fastFoodFried";

export type HistoricalMealSlotId =
  | "breakfast"
  | "midMorningSnack"
  | "lunch"
  | "afternoonSnack"
  | "dinner"
  | "nightSnack";

interface ConsultationStore {
  selectedPatientId: string | null;
  currentStep: ConsultationStep;
  completedSteps: ConsultationStep[];

  anthropometric: AnthropometricFormState;
  clinical: ClinicalFormState;
  historical: HistoricalFormState;

  isAnthropometricValid: boolean;
  isClinicalValid: boolean;
  isHistoricalValid: boolean;
  setAnthropometricValidity: (valid: boolean) => void;
  setClinicalValidity: (valid: boolean) => void;
  setHistoricalValidity: (valid: boolean) => void;
  setSelectedPatientId: (patientId: string | null) => void;
  clearAnthropometric: () => void;

  setStep: (step: ConsultationStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  setAnthropometric: (data: Partial<AnthropometricFormState>) => void;
  setClinical: (data: Partial<ClinicalFormState>) => void;
  setHistorical: (data: Partial<HistoricalFormState>) => void;

  reset: () => void;
}

function calculateZScoreAndPercentile(bmi: number) {
  const mean = 16;
  const sd = 2;
  const zScore = Number(((bmi - mean) / sd).toFixed(2));
  const percentile = Math.min(99, Math.max(1, Math.round(50 + zScore * 15)));

  return { zScore, percentile };
}

const STEP_ORDER: ConsultationStep[] = ["anthropometric", "clinical"];

const INITIAL_STATE = {
  selectedPatientId: null,
  currentStep: "anthropometric" as ConsultationStep,
  completedSteps: [] as ConsultationStep[],
  anthropometric: {} as AnthropometricFormState,
  clinical: {} as ClinicalFormState,
  historical: {} as HistoricalFormState,
  isAnthropometricValid: false,
  isClinicalValid: false,
  isHistoricalValid: false,
};

export const useConsultationStore = create<ConsultationStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setAnthropometricValidity: (valid) => set({ isAnthropometricValid: valid }),
      setClinicalValidity: (valid) => set({ isClinicalValid: valid }),
      setHistoricalValidity: (valid) => set({ isHistoricalValid: valid }),

      setSelectedPatientId: (patientId) =>
        set((state) => {
          if (state.selectedPatientId === patientId) {
            return { selectedPatientId: patientId };
          }

          return {
            selectedPatientId: patientId,
            currentStep: "anthropometric",
            completedSteps: [],
            anthropometric: {},
            clinical: {},
            historical: {},
            isAnthropometricValid: false,
            isClinicalValid: false,
            isHistoricalValid: false,
          };
        }),

      clearAnthropometric: () =>
        set({
          anthropometric: {},
          isAnthropometricValid: false,
        }),

      setStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const { currentStep, completedSteps } = get();
        const index = STEP_ORDER.indexOf(currentStep);

        if (index < STEP_ORDER.length - 1) {
          set({
            currentStep: STEP_ORDER[index + 1],
            completedSteps: Array.from(new Set([...completedSteps, currentStep])),
          });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        const index = STEP_ORDER.indexOf(currentStep);

        if (index > 0) {
          set({ currentStep: STEP_ORDER[index - 1] });
        }
      },

      setAnthropometric: (data) =>
        set((state) => {
          const next = {
            ...state.anthropometric,
            ...data,
          };

          if (next.weightKg && next.heightM && next.heightM > 0) {
            const bmi = next.weightKg / (next.heightM * next.heightM);
            next.bmi = Number(bmi.toFixed(2));
            const { zScore, percentile } = calculateZScoreAndPercentile(next.bmi);
            next.zScore = zScore;
            next.percentile = percentile;
          }

          return { anthropometric: next };
        }),

      setClinical: (data) =>
        set((state) => ({
          clinical: { ...state.clinical, ...data },
        })),

      setHistorical: (data) =>
        set((state) => ({
          historical: { ...state.historical, ...data },
        })),

      reset: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: "consultation-store",
      partialize: (state) => ({
        selectedPatientId: state.selectedPatientId,
        anthropometric: state.anthropometric,
        clinical: state.clinical,
        historical: state.historical,
      }),
    }
  )
);
