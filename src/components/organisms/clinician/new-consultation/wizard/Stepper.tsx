export const Stepper = ({ currentStep }: { currentStep: string }) => {
    const steps = ["anthropometric", "clinical"];
    const stepLabel: Record<string, string> = {
        anthropometric: "Antropometrico",
        clinical: "Clínico",
        historical: "Historico",
    };

    return (
        <div className="mb-6 overflow-x-auto">
            <div className="flex min-w-max gap-2 sm:gap-4">
                {steps.map((step, i) => (
                    <div
                        key={step}
                        className={`shrink-0 rounded-full px-3 py-2 text-xs sm:px-4 sm:text-sm ${currentStep === step
                                ? "bg-nutri-primary text-nutri-white"
                                : "bg-nutri-light-grey text-nutri-dark-grey"
                            }`}
                    >
                        {i + 1}. {stepLabel[step] ?? step}
                    </div>
                ))}
            </div>
        </div>
    );
};
