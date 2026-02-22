"use client";

import Link from "next/link";
import { ArrowLeft, BookOpenCheck, Lightbulb } from "lucide-react";

import { Heading } from "@/components/atoms/Heading";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/store/useAuthStore";

const EDUCATION_TIPS: string[] = [
  "Combina frutas de colores distintos para aumentar vitaminas en cada comida.",
  "Prefiere agua frente a bebidas azucaradas durante el dia.",
  "Incluye al menos una verdura en almuerzo y cena.",
  "Procura 20 minutos de juego activo al aire libre todos los dias.",
];

export default function PatientEducationPage() {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Heading
        variant="panel"
        eyebrow="Educacion nutricional"
        description="Esta seccion te ayuda a entender el por que de cada recomendacion y como convertirla en un habito diario."
      >
        Aprende con pasos pequenos, {user.firstName}
      </Heading>

      <Card className="p-5">
        <header className="mb-4 flex items-center gap-2">
          <BookOpenCheck size={18} className="text-nutri-primary" aria-hidden />
          <h2 className="text-lg font-semibold text-nutri-primary">Ideas para hoy</h2>
        </header>

        <div className="space-y-2">
          {EDUCATION_TIPS.map((tip) => (
            <div
              key={tip}
              className="rounded-xl border border-nutri-light-grey bg-nutri-off-white/70 px-3 py-2 text-sm text-nutri-dark-grey"
            >
              <p className="flex items-start gap-2">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-500" aria-hidden />
                <span>{tip}</span>
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Link
        href="/dashboard/patient"
        className="inline-flex items-center gap-2 rounded-lg border border-nutri-primary/20 bg-nutri-white px-4 py-2 text-sm font-semibold text-nutri-primary transition-colors hover:bg-nutri-off-white"
      >
        <ArrowLeft size={16} aria-hidden />
        Volver al inicio
      </Link>
    </div>
  );
}
