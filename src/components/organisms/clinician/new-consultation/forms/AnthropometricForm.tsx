"use client";

import { useEffect, useState } from "react";
import { useConsultationStore } from "@/store/useConsultationStore";
import { validateRange } from "@/utils/validators";
import { ValidatedInput } from "@/components/ui/ValidatedInput";

type EditableAnthroField =
    | "weightKg"
    | "heightM"
    | "muacCm"
    | "headCircumferenceCm";

const STORAGE_KEY = "anthropometricForm";

// Función para cargar valores de localStorage (si existen)
const loadSavedValues = (): Partial<Record<EditableAnthroField, string>> => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    try {
        return JSON.parse(saved);
    } catch {
        return {};
    }
};

export const AnthropometricForm = () => {
    const {
        anthropometric,
        setAnthropometric,
        setAnthropometricValidity,
    } = useConsultationStore();

    // Inicializamos con los valores guardados directamente
    const [values, setValues] = useState<Partial<Record<EditableAnthroField, string>>>(loadSavedValues());
    const [errors, setErrors] = useState<Partial<Record<EditableAnthroField, string>>>({});

    /** Sincronizamos el store con valores guardados al montar */
    useEffect(() => {
        Object.entries(values).forEach(([key, rawValue]) => {
            const normalized = rawValue.replace(",", ".");
            const value = parseFloat(normalized);
            if (!isNaN(value)) {
                setAnthropometric({ [key]: value });
            }
        });
    }, [values, setAnthropometric]);

    const handleChange = (
        key: EditableAnthroField,
        rawValue: string,
        min: number,
        max: number,
        label: string
    ) => {
        setValues((v) => {
            const next = { ...v, [key]: rawValue };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });

        const trimmed = rawValue.trim();
        if (!trimmed) {
            setErrors((e) => ({ ...e, [key]: "Campo requerido" }));
            setAnthropometric({ [key]: undefined });
            return;
        }

        const normalized = trimmed.replace(",", ".");
        const value = parseFloat(normalized);

        if (isNaN(value)) {
            setErrors((e) => ({ ...e, [key]: "Número inválido" }));
            setAnthropometric({ [key]: undefined });
            return;
        }

        const error = validateRange(value, min, max, label);
        setErrors((e) => ({ ...e, [key]: error ?? undefined }));

        if (!error) {
            setAnthropometric({ [key]: value });
        } else {
            setAnthropometric({ [key]: undefined });
        }
    };

    const hasErrors = Object.values(errors).some(Boolean);

    useEffect(() => {
        const hasAllValues =
            anthropometric.weightKg !== undefined &&
            anthropometric.heightM !== undefined &&
            anthropometric.muacCm !== undefined &&
            anthropometric.headCircumferenceCm !== undefined;

        setAnthropometricValidity(hasAllValues && !hasErrors);
    }, [anthropometric, hasErrors, setAnthropometricValidity]);

    return (
        <section className="space-y-6 rounded-xl bg-nutri-white p-6">
            <h3 className="text-lg font-semibold text-nutri-primary">
                Datos Antropométricos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ValidatedInput
                    label="Peso actual"
                    placeholder="Ej: 1.1"
                    suffix="kg"
                    value={values.weightKg ?? ""}
                    error={errors.weightKg}
                    onChange={(v) =>
                        handleChange("weightKg", v, 1, 300, "Peso")
                    }
                />

                <ValidatedInput
                    label="Talla / Longitud"
                    placeholder="Ej: 0.3"
                    suffix="m"
                    value={values.heightM ?? ""}
                    error={errors.heightM}
                    onChange={(v) =>
                        handleChange("heightM", v, 0.3, 2.5, "Talla")
                    }
                />

                <ValidatedInput
                    label="Perímetro braquial (MUAC)"
                    placeholder="Ej: 5.1"
                    suffix="cm"
                    value={values.muacCm ?? ""}
                    error={errors.muacCm}
                    onChange={(v) =>
                        handleChange("muacCm", v, 5, 40, "MUAC")
                    }
                />

                <ValidatedInput
                    label="Perímetro cefálico"
                    placeholder="Ej: 20.1"
                    suffix="cm"
                    value={values.headCircumferenceCm ?? ""}
                    error={errors.headCircumferenceCm}
                    onChange={(v) =>
                        handleChange("headCircumferenceCm", v, 20, 70, "PC")
                    }
                />
            </div>
        </section>
    );
};

