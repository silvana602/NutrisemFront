"use client";

import React, { useMemo } from "react";
import { db } from "@/mocks/db";
import { ReportCard } from "./ReportsCard";
import { Button } from "@/components/ui/Button";

export const ReportsContent: React.FC = () => {
  const totalPatients = db.patients.length;

  const newPatients = useMemo(() => {
    const now = new Date();
    const thirtyDaysMs = 1000 * 60 * 60 * 24 * 30;

    const patientIds = new Set(
      db.histories
        .filter((h) => now.getTime() - h.creationDate.getTime() <= thirtyDaysMs)
        .map((h) => h.patientId)
    );

    return patientIds.size;
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <ReportCard title="Total pacientes" value={totalPatients} />
        <ReportCard title="Nuevos pacientes (ultimo mes)" value={newPatients} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex h-48 items-center justify-center rounded border border-nutri-light-grey bg-nutri-light-grey p-4 text-nutri-dark-grey">
          Tendencia de casos (grafico)
        </div>
        <div className="flex h-48 items-center justify-center rounded border border-nutri-light-grey bg-nutri-light-grey p-4 text-nutri-dark-grey">
          Evolucion de casos ultimos meses
        </div>
        <div className="flex h-48 items-center justify-center rounded border border-nutri-light-grey bg-nutri-light-grey p-4 text-nutri-dark-grey">
          Pacientes por mes
        </div>
        <div className="flex h-48 items-center justify-center rounded border border-nutri-light-grey bg-nutri-light-grey p-4 text-nutri-dark-grey">
          Distribucion diagnosticos realizados
        </div>
      </div>

      <div className="flex gap-4">
        <Button>Reporte mensual (PDF)</Button>
      </div>
    </div>
  );
};
