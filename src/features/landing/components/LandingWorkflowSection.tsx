import { Card } from "@/components/ui/Card";
import type { LandingWorkflowStep } from "../types";

type LandingWorkflowSectionProps = {
  steps: LandingWorkflowStep[];
};

export function LandingWorkflowSection({ steps }: LandingWorkflowSectionProps) {
  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-nutri-secondary">
          Metodo Nutrisem
        </p>
        <h2 className="text-2xl font-bold text-nutri-primary sm:text-3xl">
          Flujo clinico operativo de punta a punta
        </h2>
      </header>

      <Card className="p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <article
              key={step.stepId}
              className="relative rounded-2xl border border-nutri-light-grey bg-nutri-off-white/55 p-4"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-nutri-primary text-xs font-bold text-nutri-white">
                {index + 1}
              </span>
              <h3 className="mt-3 text-base font-semibold text-nutri-primary">{step.title}</h3>
              <p className="mt-2 text-sm text-nutri-dark-grey">{step.description}</p>
            </article>
          ))}
        </div>
      </Card>
    </section>
  );
}
