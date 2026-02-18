"use client";

import { cn } from "@/lib/utils";

type StepItem = {
  id: string;
  title: string;
};

type StepDotsProps = {
  steps: readonly StepItem[];
  currentStep: number;
  maxUnlockedStep: number;
  disabled?: boolean;
  onStepChange: (step: number) => void;
};

export function StepDots({
  steps,
  currentStep,
  maxUnlockedStep,
  disabled,
  onStepChange,
}: StepDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2 pt-1">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isUnlocked = index <= maxUnlockedStep;

        return (
          <button
            key={step.id}
            type="button"
            aria-label={`Ir al punto ${index + 1}`}
            disabled={disabled || !isUnlocked}
            onClick={() => onStepChange(index)}
            className={cn(
              "h-3.5 w-3.5 rounded-full border transition-colors",
              isActive
                ? "border-nutri-primary bg-nutri-primary"
                : isUnlocked
                  ? "border-nutri-secondary bg-nutri-white hover:bg-nutri-secondary/25"
                  : "cursor-not-allowed border-nutri-light-grey bg-nutri-light-grey/70"
            )}
          />
        );
      })}
    </div>
  );
}
