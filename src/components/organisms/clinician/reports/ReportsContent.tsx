"use client";

import React, { useMemo } from "react";
import { db } from "@/mocks/db";
import { ReportCard } from "./ReportsCard";
import { Button } from "@/components/ui/Button";

export const ReportsContent: React.FC = () => {
  // --- Total pacientes atendidos y nuevos ---
  const totalPatients = db.patients.length;

  const newPatients = useMemo(() => {
    // Asumimos "nuevo" = pacientes con birthDate en el último mes
    const now = new Date();
    return db.patients.filter((p) => {
      if (!p.createdAt) return false;
      const created = new Date(p.createdAt);
      const diff = now.getTime() - created.getTime();
      return diff <= 1000 * 60 * 60 * 24 * 30; // últimos 30 días
    }).length;
  }, []);

  return (
    <div className="space-y-6">
      {/* Métricas generales */}
      <div className="grid md:grid-cols-3 gap-6">
        <ReportCard title="Total pacientes" value={totalPatients} />
        <ReportCard title="Nuevos pacientes (último mes)" value={newPatients} />
      </div>

      {/* Placeholder para otros gráficos */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 border rounded h-48 flex items-center justify-center bg-gray-100">
          Tendencia de Casos (Gráfico)
        </div>
        <div className="p-4 border rounded h-48 flex items-center justify-center bg-gray-100">
          Evolución de casos últimos meses
        </div>
        <div className="p-4 border rounded h-48 flex items-center justify-center bg-gray-100">
          Pacientes por mes
        </div>
        <div className="p-4 border rounded h-48 flex items-center justify-center bg-gray-100">
          Distribución diagnósticos realizados
        </div>
      </div>

      {/* Botones de export */}
      <div className="flex gap-4">
        <Button>
          Reporte mensual (PDF)
        </Button>
      </div>
    </div>
  );
};
