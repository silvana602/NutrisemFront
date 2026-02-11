export const Stepper = ({ currentStep }: { currentStep: string }) => {
    const steps = ["anthropometric", "clinical"];

    return (
        <div className="flex gap-4 mb-6">
            {steps.map((step, i) => (
                <div
                    key={step}
                    className={`px-4 py-2 rounded-full text-sm ${currentStep === step
                            ? "bg-nutri-primary text-nutri-white"
                            : "bg-nutri-light-grey text-nutri-dark-grey"
                        }`}
                >
                    {i + 1}. {step}
                </div>
            ))}
        </div>
    );
};
