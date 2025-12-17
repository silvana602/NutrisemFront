"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Heading } from "../../atoms/Heading";
import { IconButton } from "../../atoms/IconButton";
import { SectionTitle } from "../../atoms/SectionTitle";
import { MetricsGrid } from "../../molecules/MetricsGrid";
import { ChartsGrid } from "../../molecules/ChartsGrid";
import { colors } from "@/lib/colors";

export default function AdminDashboardContent() {
  const user = useAuthStore(s => s.user);
  if (!user) return null;
  
  const metrics = [
    { label: "Pacientes", value: 40 },
    { label: "Pacientes mujeres", value: 22 },
    { label: "Pacientes varones", value: 18 }
  ];

  return (
    <div
      className="p-6 min-h-screen"
      style={{ backgroundColor: colors.offWhite }}
    >
      <div className="flex justify-between items-center mb-6">
        <Heading>
          Bienvenid@, Administrador(a) {user.firstName} {user.lastName}
        </Heading>

        <IconButton label="Añadir nuevo profesional medico" />
      </div>

      {/* Vista general */}
      <SectionTitle>
        Vista general de la actividad del sistema
      </SectionTitle>

      <p className="text-sm mb-4" style={{ color: colors.darkGrey }}>
        (número de pacientes, médicos, consultas, diagnósticos recientes, etc.)
      </p>

      <MetricsGrid metrics={metrics} />

      {/* Gráficos */}
      <SectionTitle>Gráficos globales</SectionTitle>

      <p className="text-sm mb-4" style={{ color: colors.darkGrey }}>
        de desempeño, crecimiento de pacientes, comparativas por género o edad.
      </p>

      <ChartsGrid />
    </div>
  );
}
