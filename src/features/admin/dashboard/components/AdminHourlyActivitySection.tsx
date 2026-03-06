import { SectionTitle } from "@/components/atoms/SectionTitle";
import type { HourlyActivityPoint } from "../types";
import { HourlyUsageChart } from "./HourlyUsageChart";

type AdminHourlyActivitySectionProps = {
  hourlyActivity: HourlyActivityPoint[];
  peakActivityLabel: string;
};

export function AdminHourlyActivitySection({
  hourlyActivity,
  peakActivityLabel,
}: AdminHourlyActivitySectionProps) {
  return (
    <section className="nutri-platform-surface p-4 sm:p-5">
      <SectionTitle className="mt-0">Gráfico de actividad por horas</SectionTitle>
      <p className="mt-2 text-sm text-nutri-dark-grey/85">
        Curva de uso de la plataforma para identificar horas pico de operación.
      </p>

      <HourlyUsageChart points={hourlyActivity} />

      <p className="mt-3 text-sm font-semibold text-nutri-primary">
        Hora pico detectada: {peakActivityLabel}
      </p>
    </section>
  );
}
