"use client";

import React from "react";
import { Heading } from "@/components/atoms/Heading";

export const NewConsultationHeader: React.FC = () => {
  const now = new Date();

  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(now);

  const formattedTime = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(now);

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Heading
          containerClassName="space-y-2"
          description="Registra una nueva consulta pediatrica y completa el flujo por secciones."
        >
          Nueva consulta
        </Heading>

        <div className="nutri-clinician-surface-soft rounded-xl px-4 py-3 text-sm leading-tight text-nutri-dark-grey sm:text-right">
          <p className="font-semibold text-nutri-primary">Fecha de consulta: {formattedDate}</p>
          <p>Hora de consulta: {formattedTime}</p>
        </div>
      </div>
    </header>
  );
};
