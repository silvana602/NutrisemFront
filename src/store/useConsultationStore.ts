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
  ageYears?: number;
}

interface ConsultationStore {
  selectedPatientId: string | null;
  currentStep: ConsultationStep;
  completedSteps: ConsultationStep[];

  anthropometric: AnthropometricFormState;
  clinical: ClinicalFormState;

  isAnthropometricValid: boolean;
  isClinicalValid: boolean;
  setAnthropometricValidity: (valid: boolean) => void;
  setClinicalValidity: (valid: boolean) => void;
  setSelectedPatientId: (patientId: string | null) => void;
  clearAnthropometric: () => void;

  setStep: (step: ConsultationStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  setAnthropometric: (data: Partial<AnthropometricFormState>) => void;
  setClinical: (data: Partial<ClinicalFormState>) => void;

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
  isAnthropometricValid: false,
  isClinicalValid: false,
};

export const useConsultationStore = create<ConsultationStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setAnthropometricValidity: (valid) => set({ isAnthropometricValid: valid }),
      setClinicalValidity: (valid) => set({ isClinicalValid: valid }),

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
            isAnthropometricValid: false,
            isClinicalValid: false,
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

      reset: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: "consultation-store",
      partialize: (state) => ({
        selectedPatientId: state.selectedPatientId,
        anthropometric: state.anthropometric,
        clinical: state.clinical,
      }),
    }
  )
);
