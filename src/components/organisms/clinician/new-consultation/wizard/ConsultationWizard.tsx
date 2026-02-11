"use client";

import { Stepper } from "./Stepper";
import { Button } from "@/components/ui/Button";
import { useConsultationStore } from "@/store/useConsultationStore";
import { AnthropometricForm } from "../forms/AnthropometricForm";
/* import { ClinicalForm } from "../forms/ClinicalForm"; // ejemplo
import { HistoryForm } from "../forms/HistoryForm"; // ejemplo */

export const ConsultationWizard = () => {
    const {
        currentStep,
        nextStep,
        prevStep,
        isAnthropometricValid,
        /* isClinicalValid,
        isHistoryValid, */
    } = useConsultationStore();

    // Orden de pasos
    const steps = ["anthropometric", "clinical", "history"] as const;

    // Mapear cada step a su componente
    const stepComponents: Record<string, JSX.Element> = {
        anthropometric: <AnthropometricForm />,
        /* clinical: <ClinicalForm />,
        history: <HistoryForm />, */
    };

    // Validaciones por step
    const stepValidity: Record<string, boolean> = {
        anthropometric: isAnthropometricValid,
        /* clinical: isClinicalValid,
        history: isHistoryValid, */
    };

    const currentIndex = steps.indexOf(currentStep);

    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < steps.length - 1;
    const isCurrentValid = stepValidity[currentStep];

    return (
        <div className="space-y-6">
            <Stepper currentStep={currentStep} />

            <div>{stepComponents[currentStep]}</div>

            <div className="flex justify-between pt-6">
                {/* Botón Volver */}
                {hasPrev && (
                    <Button variant="secondary" onClick={prevStep}>
                        Volver
                    </Button>
                )}

                {/* Botón Continuar solo si hay siguiente paso y formulario válido */}
                {hasNext && isCurrentValid && (
                    <Button variant="primary" onClick={nextStep}>
                        Continuar
                    </Button>
                )}
            </div>
        </div>
    );
};
