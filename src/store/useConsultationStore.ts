import { create } from "zustand";
import { AnthropometricData } from "@/types";

interface AnthropometricState {
    weightKg?: number;
    heightM?: number;
    muacCm?: number;
    headCircumferenceCm?: number;
    bmi?: number;
    zscore?: number;
}

interface ConsultationState {
    anthropometric: AnthropometricState;
    setAnthropometric: (data: Partial<AnthropometricData>) => void;
}

export const useConsultationStore = create<ConsultationState>((set) => ({
    anthropometric: {},

    setAnthropometric: (data) =>
        set((state) => {
            const next: AnthropometricState = {
                ...state.anthropometric,
                ...data,
            };

            if (next.weightKg && next.heightM) {
                const bmi =
                    next.weightKg / (next.heightM * next.heightM);

                next.bmi = Number(bmi.toFixed(2));
            }

            return { anthropometric: next };
        }),
}));

export function calculateZScore(bmi: number) {
    // ⚠️ Placeholder: luego puedes usar tablas WHO reales
    const mean = 16;
    const sd = 2;

    const zScore = Number(((bmi - mean) / sd).toFixed(2));
    const percentile = Math.min(
        99,
        Math.max(1, Math.round(50 + zScore * 15))
    );

    return { zScore, percentile };
}
