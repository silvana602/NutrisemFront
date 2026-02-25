"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Heading } from "@/components/atoms/Heading";
import { IconButton } from "@/components/atoms/IconButton";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import { MetricsGrid } from "@/components/molecules/MetricsGrid";
import { ChartsGrid } from "@/components/molecules/ChartsGrid";

export default function AdminDashboardContent() {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  const metrics = [
    { label: "Pacientes", value: 40 },
    { label: "Pacientes mujeres", value: 22 },
    { label: "Pacientes varones", value: 18 },
  ];

  return (
    <div className="nutri-platform-page px-1 py-1 sm:px-2">
      <div className="nutri-platform-page-header flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <Heading
          containerClassName="space-y-2"
          description="Panel global para seguimiento de actividad clinica y operativa del sistema."
        >
          Bienvenid@, Administrador(a) {user.firstName} {user.lastName}
        </Heading>

        <IconButton
          label="Anadir nuevo profesional médico"
          className="w-full justify-center sm:w-auto"
        />
      </div>

      <section className="nutri-platform-surface p-4 sm:p-5">
        <SectionTitle className="mt-0">Vista general de la actividad del sistema</SectionTitle>
        <p className="mt-2 text-sm text-nutri-dark-grey/85">
          Número de pacientes, médicos, consultas y diagnósticos recientes.
        </p>
        <MetricsGrid metrics={metrics} />
      </section>

      <section className="nutri-platform-surface p-4 sm:p-5">
        <SectionTitle className="mt-0">Graficos globales</SectionTitle>
        <p className="mt-2 text-sm text-nutri-dark-grey/85">
          Desempeno general, crecimiento de pacientes y comparativas por genero o edad.
        </p>
        <ChartsGrid />
      </section>
    </div>
  );
}
