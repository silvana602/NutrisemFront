import { Activity, ArrowRight, BarChart3, ClipboardList } from "lucide-react";

import { Heading } from "@/components/atoms/Heading";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { LandingPulseMetric } from "../types";

type LandingHeroSectionProps = {
  pulseMetrics: LandingPulseMetric[];
  onStartNow: () => void;
  onExplore: () => void;
};

function getPulseToneClassName(tone: LandingPulseMetric["tone"]): string {
  if (tone === "up") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "attention") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-nutri-light-grey bg-nutri-off-white text-nutri-dark-grey";
}

export function LandingHeroSection({
  pulseMetrics,
  onStartNow,
  onExplore,
}: LandingHeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-nutri-primary/10 bg-gradient-to-br from-nutri-white via-nutri-off-white to-nutri-light-grey/70 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <div className="pointer-events-none absolute -left-16 top-8 h-40 w-40 rounded-full bg-nutri-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-48 w-48 rounded-full bg-nutri-primary/15 blur-3xl" />

      <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-nutri-primary/15 bg-nutri-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-nutri-secondary">
            <Activity size={14} aria-hidden />
            Plataforma clinica digital
          </div>

          <Heading
            className="text-3xl font-extrabold leading-tight text-nutri-primary sm:text-4xl lg:text-5xl"
            description="Supervisa crecimiento, detecta riesgos y activa intervenciones nutricionales oportunas desde una sola plataforma."
            descriptionClassName="max-w-xl text-sm leading-relaxed text-nutri-dark-grey sm:text-base"
          >
            Nutrisem transforma datos clínicos en decisiones nutricionales accionables
          </Heading>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" className="px-5 py-3 text-sm" onClick={onStartNow}>
              Ingresar al sistema
              <ArrowRight size={16} aria-hidden />
            </Button>
            <Button variant="outline" className="px-5 py-3 text-sm" onClick={onExplore}>
              Ver funcionalidades
            </Button>
          </div>

        </div>

        <div className="rounded-3xl border border-nutri-primary/15 bg-gradient-to-br from-nutri-primary via-[#23465f] to-nutri-secondary p-5 text-nutri-white shadow-[0_24px_42px_rgba(23,42,58,0.28)] sm:p-6">
          <header className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-nutri-off-white/85">
                Pulso nutricional
              </p>
              <p className="mt-1 text-2xl font-bold sm:text-3xl">Panel en tiempo real</p>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-nutri-white/20 bg-nutri-white/10">
              <BarChart3 size={18} aria-hidden />
            </div>
          </header>

          <div className="space-y-3">
            {pulseMetrics.map((metric) => (
              <article
                key={metric.metricId}
                className="rounded-2xl border border-nutri-white/20 bg-nutri-white/10 p-3 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-nutri-white">{metric.label}</p>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                      getPulseToneClassName(metric.tone)
                    )}
                  >
                    {metric.delta}
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold leading-none">{metric.value}</p>
              </article>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-nutri-off-white/90">
            <ClipboardList size={14} aria-hidden />
            Datos consolidados de control clínico y antropometria
          </div>
        </div>
      </div>
    </section>
  );
}
