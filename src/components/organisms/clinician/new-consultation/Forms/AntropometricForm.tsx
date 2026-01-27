"use client";

import { useState } from "react";
import { useConsultationStore } from "@/store/useConsultationStore";
import { validateRange } from "@/utils/validators";
import { colors } from "@/lib/colors";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { Button } from "@/components/ui/Button";

export const AnthropometricForm = () => {
    const { setAnthropometric } = useConsultationStore();

    const [peso, setPeso] = useState<{ value?: number; error?: string }>({});
    const [talla, setTalla] = useState<{ value?: number; error?: string }>({});
    const [muac, setMuac] = useState<{ value?: number; error?: string }>({});
    const [pc, setPc] = useState<{ value?: number; error?: string }>({});

    /* ---------- Handlers ---------- */

    const handlePesoChange = (v: number) => {
        const rawError = validateRange(v, 1, 300, "Peso");
        setPeso({ value: v, error: rawError ?? undefined });
        if (!rawError) setAnthropometric({ weightKg: v });
    };

    const handleTallaChange = (v: number) => {
        const rawError = validateRange(v, 0.3, 2.5, "Talla");
        setTalla({ value: v, error: rawError ?? undefined });
        if (!rawError) setAnthropometric({ heightM: v });
    };

    const handleMuacChange = (v: number) => {
        const rawError = validateRange(v, 5, 40, "Perímetro braquial");
        setMuac({ value: v, error: rawError ?? undefined });
        if (!rawError) setAnthropometric({ muacCm: v });
    };

    const handlePcChange = (v: number) => {
        const rawError = validateRange(v, 20, 70, "Perímetro cefálico");
        setPc({ value: v, error: rawError ?? undefined });
        if (!rawError) setAnthropometric({ headCircumferenceCm: v });
    };

    /* ---------- Validación del formulario ---------- */
    const isFormValid =
        peso.value !== undefined &&
        talla.value !== undefined &&
        muac.value !== undefined &&
        pc.value !== undefined &&
        !peso.error &&
        !talla.error &&
        !muac.error &&
        !pc.error;

    const handleContinue = () => {
        if (!isFormValid) return;

        console.log("Continuar con datos:", {
            peso: peso.value,
            talla: talla.value,
            muac: muac.value,
            pc: pc.value,
        });

        // Aquí podrías avanzar al siguiente paso o sección
    };

    /* ---------- UI ---------- */
    return (
        <section
            className="rounded-xl p-6 space-y-6"
            style={{
                backgroundColor: colors.white,
                borderColor: colors.primary,
            }}
        >
            <h3 className="font-semibold text-lg" style={{ color: colors.primary }}>
                Datos Antropométricos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ValidatedInput
                    label="Peso actual"
                    placeholder="Ej: 65.4"
                    suffix="kg"
                    value={peso.value}
                    error={peso.error}
                    onChange={handlePesoChange}
                />

                <ValidatedInput
                    label="Talla / Longitud"
                    placeholder="Ej: 1.68"
                    suffix="m"
                    value={talla.value}
                    error={talla.error}
                    onChange={handleTallaChange}
                />

                <ValidatedInput
                    label="Perímetro braquial (MUAC)"
                    placeholder="Ej: 13.5"
                    suffix="cm"
                    value={muac.value}
                    error={muac.error}
                    onChange={handleMuacChange}
                />

                <ValidatedInput
                    label="Perímetro cefálico"
                    placeholder="Ej: 49"
                    suffix="cm"
                    value={pc.value}
                    error={pc.error}
                    onChange={handlePcChange}
                />
            </div>

            {/* ---------- Botón Continuar ---------- */}
            <div className="flex justify-end pt-4">
                <Button
                    variant="primary"
                    disabled={!isFormValid}
                    onClick={handleContinue}
                >
                    Continuar
                </Button>
            </div>
        </section>
    );
};
