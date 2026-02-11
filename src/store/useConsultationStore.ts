import { create } from "zustand";

/* =========================
   Tipos de pasos (Wizard)
========================= */
export type ConsultationStep =
    | "anthropometric"
    | "clinical";

/* =========================
   Estados de formulario
========================= */
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

/* =========================
   Store
========================= */
interface ConsultationStore {
    currentStep: ConsultationStep;
    completedSteps: ConsultationStep[];

    anthropometric: AnthropometricFormState;
    clinical: ClinicalFormState;

    /** ✅ VALIDACIÓN DEL PASO */
    isAnthropometricValid: boolean;
    setAnthropometricValidity: (valid: boolean) => void;

    setStep: (step: ConsultationStep) => void;
    nextStep: () => void;
    prevStep: () => void;

    setAnthropometric: (
        data: Partial<AnthropometricFormState>
    ) => void;

    setClinical: (
        data: Partial<ClinicalFormState>
    ) => void;

    reset: () => void;
}

/* =========================
   Utilidades de cálculo
========================= */
function calculateZScoreAndPercentile(bmi: number) {
    const mean = 16;
    const sd = 2;

    const zScore = Number(((bmi - mean) / sd).toFixed(2));
    const percentile = Math.min(
        99,
        Math.max(1, Math.round(50 + zScore * 15))
    );

    return { zScore, percentile };
}

/* =========================
   Orden del Wizard
========================= */
const STEP_ORDER: ConsultationStep[] = [
    "anthropometric",
    "clinical",
];

/* =========================
   Store implementation
========================= */
export const useConsultationStore = create<ConsultationStore>(
    (set, get) => ({
        currentStep: "anthropometric",
        completedSteps: [],

        anthropometric: {},
        clinical: {},

        /** ✅ VALIDACIÓN */
        isAnthropometricValid: false,

        setAnthropometricValidity: (valid) =>
            set({ isAnthropometricValid: valid }),

        setStep: (step) => set({ currentStep: step }),

        nextStep: () => {
            const { currentStep, completedSteps } = get();
            const index = STEP_ORDER.indexOf(currentStep);

            if (index < STEP_ORDER.length - 1) {
                set({
                    currentStep: STEP_ORDER[index + 1],
                    completedSteps: Array.from(
                        new Set([...completedSteps, currentStep])
                    ),
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
                    const bmi =
                        next.weightKg / (next.heightM * next.heightM);

                    next.bmi = Number(bmi.toFixed(2));

                    const { zScore, percentile } =
                        calculateZScoreAndPercentile(next.bmi);

                    next.zScore = zScore;
                    next.percentile = percentile;
                }

                return { anthropometric: next };
            }),

        setClinical: (data) =>
            set((state) => ({
                clinical: { ...state.clinical, ...data },
            })),

        reset: () =>
            set({
                currentStep: "anthropometric",
                completedSteps: [],
                anthropometric: {},
                clinical: {},
                isAnthropometricValid: false,
            }),
    })
);
