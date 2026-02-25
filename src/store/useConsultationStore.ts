import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db, seedOnce } from "@/mocks/db";
import { calculateAgeInMonths } from "@/lib/pediatricAge";
import { calculatePediatricBmiZScoreAndPercentile } from "@/lib/pediatricGrowth";
import type {
  AnthropometricData,
  AntecedentAppetiteLevel,
  AntecedentFoodFrequency,
  AntecedentFoodGroupId,
  AntecedentMealSlotId,
  AntecedentMealsPerDay,
  AntecedentPrimaryCaregiver,
  AntecedentRecallSlotId,
  AntecedentSleepQuality,
  AntecedentVaccinationStatus,
  AntecedentYesNo,
  Antecedents,
  ClinicalBilateralEdemaGrade,
  ClinicalData,
  ClinicalInformantType,
  ClinicalPrematurityOption,
} from "@/types";

seedOnce();

export type ConsultationStep = "anthropometric" | "clinical" | "historical";

export type AnthropometricFormState = Partial<
  Omit<AnthropometricData, "anthropometricDataId" | "consultationId">
>;

type ClinicalMultiFieldKey =
  | "alarmSigns"
  | "activityLevel"
  | "apathy"
  | "hairCondition"
  | "skinCondition"
  | "edema"
  | "dentition"
  | "dehydration";

type ClinicalFormStateBase = Omit<ClinicalData, "clinicalDataId" | "consultationId">;

export type ClinicalFormState = Omit<
  ClinicalFormStateBase,
  ClinicalMultiFieldKey | "informantType" | "prematurity" | "bilateralEdemaGrade"
> & {
  [K in ClinicalMultiFieldKey]?: string[];
} & {
  informantType?: ClinicalInformantType;
  prematurity?: ClinicalPrematurityOption;
  bilateralEdemaGrade?: ClinicalBilateralEdemaGrade;
};

export type HistoricalFoodFrequency = AntecedentFoodFrequency;

export type HistoricalFoodGroupId = AntecedentFoodGroupId;

export type HistoricalMealSlotId = AntecedentMealSlotId;

export type HistoricalRecallSlotId = AntecedentRecallSlotId;

type HistoricalFormStateBase = Omit<Antecedents, "antecedentsId" | "consultationId" | "recentIllnesses">;

export type HistoricalFormState = Omit<
  HistoricalFormStateBase,
  | "mealsPerDay"
  | "addedSugarSalt"
  | "appetiteLevel"
  | "vaccinationStatus"
  | "safeWaterAccess"
  | "basicSanitation"
  | "foodInsecurityConcern"
  | "foodInsecurityMealSkip"
  | "primaryCaregiver"
  | "daycareAttendance"
  | "sleepQuality"
> & {
  recentIllnesses?: string[];
  mealsPerDay?: AntecedentMealsPerDay;
  addedSugarSalt?: AntecedentYesNo;
  appetiteLevel?: AntecedentAppetiteLevel;
  vaccinationStatus?: AntecedentVaccinationStatus;
  safeWaterAccess?: AntecedentYesNo;
  basicSanitation?: AntecedentYesNo;
  foodInsecurityConcern?: AntecedentYesNo;
  foodInsecurityMealSkip?: AntecedentYesNo;
  primaryCaregiver?: AntecedentPrimaryCaregiver;
  daycareAttendance?: AntecedentYesNo;
  sleepQuality?: AntecedentSleepQuality;
};

export interface SavedConsultationSnapshot {
  savedAt: string;
  patientId: string;
  anthropometric: AnthropometricFormState;
  clinical: ClinicalFormState;
  historical: HistoricalFormState;
}

interface ConsultationStore {
  selectedPatientId: string | null;
  currentStep: ConsultationStep;
  completedSteps: ConsultationStep[];

  anthropometric: AnthropometricFormState;
  clinical: ClinicalFormState;
  historical: HistoricalFormState;
  lastSavedConsultation: SavedConsultationSnapshot | null;

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
  saveCurrentConsultationSnapshot: () => SavedConsultationSnapshot | null;
  clearLastSavedConsultation: () => void;

  reset: () => void;
}

const STEP_ORDER: ConsultationStep[] = ["anthropometric", "clinical", "historical"];

const INITIAL_STATE = {
  selectedPatientId: null,
  currentStep: "anthropometric" as ConsultationStep,
  completedSteps: [] as ConsultationStep[],
  anthropometric: {} as AnthropometricFormState,
  clinical: {} as ClinicalFormState,
  historical: {} as HistoricalFormState,
  lastSavedConsultation: null as SavedConsultationSnapshot | null,
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

            const patient = state.selectedPatientId
              ? db.patients.find((item) => item.patientId === state.selectedPatientId) ?? null
              : null;

            if (patient) {
              const ageMonths = calculateAgeInMonths(patient.birthDate);
              const { zScore, percentile } = calculatePediatricBmiZScoreAndPercentile(
                next.bmi,
                ageMonths,
                patient.gender
              );

              next.zScore = zScore;
              next.percentile = percentile;
            } else {
              next.zScore = undefined;
              next.percentile = undefined;
            }
          } else {
            next.bmi = undefined;
            next.zScore = undefined;
            next.percentile = undefined;
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

      saveCurrentConsultationSnapshot: () => {
        const state = get();

        if (!state.selectedPatientId) return null;

        const snapshot: SavedConsultationSnapshot = {
          savedAt: new Date().toISOString(),
          patientId: state.selectedPatientId,
          anthropometric: { ...state.anthropometric },
          clinical: {
            ...state.clinical,
            alarmSigns: state.clinical.alarmSigns ? [...state.clinical.alarmSigns] : undefined,
            activityLevel: state.clinical.activityLevel
              ? [...state.clinical.activityLevel]
              : undefined,
            apathy: state.clinical.apathy ? [...state.clinical.apathy] : undefined,
            hairCondition: state.clinical.hairCondition
              ? [...state.clinical.hairCondition]
              : undefined,
            skinCondition: state.clinical.skinCondition
              ? [...state.clinical.skinCondition]
              : undefined,
            edema: state.clinical.edema ? [...state.clinical.edema] : undefined,
            dentition: state.clinical.dentition ? [...state.clinical.dentition] : undefined,
            dehydration: state.clinical.dehydration
              ? [...state.clinical.dehydration]
              : undefined,
          },
          historical: {
            ...state.historical,
            foodFrequencyByGroup: state.historical.foodFrequencyByGroup
              ? { ...state.historical.foodFrequencyByGroup }
              : undefined,
            mealSchedule: state.historical.mealSchedule
              ? { ...state.historical.mealSchedule }
              : undefined,
            recall24h: state.historical.recall24h ? { ...state.historical.recall24h } : undefined,
            currentSupplementation: state.historical.currentSupplementation
              ? [...state.historical.currentSupplementation]
              : undefined,
            recentIllnesses: state.historical.recentIllnesses
              ? [...state.historical.recentIllnesses]
              : undefined,
          },
        };

        set({ lastSavedConsultation: snapshot });
        return snapshot;
      },

      clearLastSavedConsultation: () => set({ lastSavedConsultation: null }),

      reset: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: "consultation-store",
      partialize: (state) => ({
        selectedPatientId: state.selectedPatientId,
        anthropometric: state.anthropometric,
        clinical: state.clinical,
        historical: state.historical,
        lastSavedConsultation: state.lastSavedConsultation,
      }),
    }
  )
);
