"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { AnthropometricTrendChart } from "@/components/organisms/clinician/diagnosis/AnthropometricTrendChart";

import type { PatientDiagnosisHistoryRow } from "../types";

type PatientDiagnosisChartModalProps = {
  row: PatientDiagnosisHistoryRow | null;
  onClose: () => void;
};

export function PatientDiagnosisChartModal({ row, onClose }: PatientDiagnosisChartModalProps) {
  useEffect(() => {
    if (!row) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [row]);

  useEffect(() => {
    if (!row) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [row, onClose]);

  if (!row) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 p-4 sm:p-8" onClick={onClose}>
      <div className="mx-auto flex h-full max-w-[1400px] flex-col" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Vista ampliada: {row.chart.title}</p>
          <Button
            type="button"
            variant="outline"
            className="border-white/30 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center">
          <AnthropometricTrendChart
            title={row.chart.title}
            unit={row.chart.unit}
            points={row.chart.points}
            interpretation={row.chart.interpretation}
            className="w-full max-w-[1280px] bg-white shadow-2xl"
            svgClassName="h-[72vh] w-full"
            onDoubleClick={onClose}
          />
        </div>

        <p className="mt-3 text-center text-xs text-white/80">
          Doble clic sobre el grafico ampliado para cerrar.
        </p>
      </div>
    </div>
  );
}
