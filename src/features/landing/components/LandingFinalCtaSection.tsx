import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";

type LandingFinalCtaSectionProps = {
  onStartNow: () => void;
};

export function LandingFinalCtaSection({ onStartNow }: LandingFinalCtaSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-nutri-primary/15 bg-gradient-to-r from-nutri-primary via-[#24465d] to-nutri-secondary px-6 py-8 text-nutri-white sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute -right-24 -top-20 h-52 w-52 rounded-full bg-nutri-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-nutri-white/10 blur-3xl" />

      <div className="relative flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-nutri-off-white/85">
            Implementacion inmediata
          </p>
          <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
            Centraliza el seguimiento nutricional y acelera la respuesta clinica
          </h2>
          <p className="text-sm text-nutri-off-white/90 sm:text-base">
            Accede al panel y empieza a trabajar con una vista integral de pacientes, recomendaciones
            y tendencias.
          </p>
        </div>

        <Button
          variant="secondary"
          className="border-nutri-white/25 bg-nutri-white text-nutri-primary hover:bg-nutri-off-white"
          onClick={onStartNow}
        >
          Comenzar ahora
          <ArrowRight size={16} aria-hidden />
        </Button>
      </div>
    </section>
  );
}
