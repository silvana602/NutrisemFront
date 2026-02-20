"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/atoms/Pagination";
import { Button } from "@/components/ui/Button";
import { calculateAgeInMonths, formatPediatricAge } from "@/lib/pediatricAge";
import { db } from "@/mocks/db";

interface Props {
  patientId: string;
}

type HistoryRow = {
  consultationId: string;
  diagnosisId: string | null;
  consultDate: Date;
  consultDateLabel: string;
  ageLabel: string;
  weightKg: number | null;
  heightM: number | null;
  bmi: number | null;
  zScore: number | null;
  nutritionalDiagnosis: string;
};

const ITEMS_PER_PAGE = 5;

function formatWeightKg(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Sin dato";
  return `${value.toFixed(2)} kg`;
}

function formatHeightM(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Sin dato";
  return `${value.toFixed(2)} m`;
}

function formatBmi(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Sin dato";
  return value.toFixed(2);
}

function formatZScore(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Sin dato";
  return value.toFixed(2);
}

function getStatusTone(status: string): string {
  const normalized = status
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("desnutricion")) return "text-rose-700";
  if (normalized.includes("riesgo")) return "text-amber-700";
  if (normalized.includes("sobrepeso") || normalized.includes("obesidad")) return "text-amber-700";
  return "text-emerald-700";
}

function buildDiagnosisUrl(patientId: string, diagnosisId: string | null, tab: "summary" | "results" = "summary"): string {
  const params = new URLSearchParams({
    patientId,
    tab,
    step: "0",
  });

  if (diagnosisId) {
    params.set("resultId", diagnosisId);
  }

  return `/dashboard/clinician/diagnosis?${params.toString()}`;
}

export const PatientsHistoryTable: React.FC<Props> = ({ patientId }) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const patient = useMemo(
    () => db.patients.find((item) => item.patientId === patientId) ?? null,
    [patientId]
  );

  const rows: HistoryRow[] = useMemo(() => {
    if (!patient) return [];

    const consultations = db.consultations
      .filter((consultation) => consultation.patientId === patientId)
      .sort((first, second) => second.date.getTime() - first.date.getTime());

    return consultations.map((consultation) => {
      const diagnosis =
        db.diagnoses.find((item) => item.consultationId === consultation.consultationId) ?? null;
      const anthropometric =
        db.anthropometricData.find((item) => item.consultationId === consultation.consultationId) ?? null;

      const bmi =
        anthropometric?.weightKg && anthropometric?.heightM
          ? anthropometric.weightKg / (anthropometric.heightM * anthropometric.heightM)
          : null;

      return {
        consultationId: consultation.consultationId,
        diagnosisId: diagnosis?.diagnosisId ?? null,
        consultDate: consultation.date,
        consultDateLabel: consultation.date.toLocaleDateString("es-BO"),
        ageLabel: formatPediatricAge(calculateAgeInMonths(patient.birthDate, consultation.date)),
        weightKg: anthropometric?.weightKg ?? null,
        heightM: anthropometric?.heightM ?? null,
        bmi: bmi !== null ? Number(bmi.toFixed(2)) : null,
        zScore: diagnosis?.zScorePercentile ?? null,
        nutritionalDiagnosis: diagnosis?.nutritionalDiagnosis ?? "Sin diagnostico",
      } satisfies HistoryRow;
    });
  }, [patient, patientId]);

  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const displayedPage = Math.min(currentPage, totalPages);

  const currentData = useMemo(() => {
    const start = (displayedPage - 1) * ITEMS_PER_PAGE;
    return rows.slice(start, start + ITEMS_PER_PAGE);
  }, [displayedPage, rows]);

  return (
    <section className="rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm sm:p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-nutri-primary">Historial de consultas</h3>
        <p className="text-xs text-nutri-dark-grey/80">Registros: {rows.length}</p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-nutri-light-grey bg-nutri-off-white px-4 py-3 text-sm text-nutri-dark-grey">
          No hay consultas registradas para este paciente.
        </p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {currentData.map((row) => (
              <article
                key={row.consultationId}
                className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/60 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-nutri-dark-grey">{row.consultDateLabel}</p>
                  <span className={`text-xs font-semibold ${getStatusTone(row.nutritionalDiagnosis)}`}>
                    {row.nutritionalDiagnosis}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-nutri-dark-grey">
                  <p>
                    <span className="font-semibold">Edad:</span> {row.ageLabel}
                  </p>
                  <p>
                    <span className="font-semibold">Peso:</span> {formatWeightKg(row.weightKg)}
                  </p>
                  <p>
                    <span className="font-semibold">Talla:</span> {formatHeightM(row.heightM)}
                  </p>
                  <p>
                    <span className="font-semibold">IMC:</span> {formatBmi(row.bmi)}
                  </p>
                  <p className="col-span-2">
                    <span className="font-semibold">Z-score:</span> {formatZScore(row.zScore)}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => router.push(buildDiagnosisUrl(patientId, row.diagnosisId, "summary"))}
                  >
                    Ver diagnostico
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => router.push(buildDiagnosisUrl(patientId, row.diagnosisId, "results"))}
                  >
                    Ver resultados
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden w-full overflow-x-auto rounded-lg border border-nutri-light-grey md:block">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-nutri-off-white">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Fecha</th>
                  <th className="px-3 py-2 text-left font-semibold">Edad</th>
                  <th className="px-3 py-2 text-left font-semibold">Peso</th>
                  <th className="px-3 py-2 text-left font-semibold">Talla</th>
                  <th className="px-3 py-2 text-left font-semibold">IMC</th>
                  <th className="px-3 py-2 text-left font-semibold">Z-score</th>
                  <th className="px-3 py-2 text-left font-semibold">Diagnostico</th>
                  <th className="px-3 py-2 text-left font-semibold">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {currentData.map((row) => (
                  <tr key={row.consultationId} className="border-t border-nutri-light-grey">
                    <td className="px-3 py-2">{row.consultDateLabel}</td>
                    <td className="px-3 py-2">{row.ageLabel}</td>
                    <td className="px-3 py-2">{formatWeightKg(row.weightKg)}</td>
                    <td className="px-3 py-2">{formatHeightM(row.heightM)}</td>
                    <td className="px-3 py-2">{formatBmi(row.bmi)}</td>
                    <td className="px-3 py-2">{formatZScore(row.zScore)}</td>
                    <td className={`px-3 py-2 font-medium ${getStatusTone(row.nutritionalDiagnosis)}`}>
                      {row.nutritionalDiagnosis}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => router.push(buildDiagnosisUrl(patientId, row.diagnosisId, "summary"))}
                        >
                          Ver diagnostico
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => router.push(buildDiagnosisUrl(patientId, row.diagnosisId, "results"))}
                        >
                          Ver resultados
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination page={displayedPage} totalPages={totalPages} onChange={setCurrentPage} />
          )}
        </>
      )}
    </section>
  );
};

export default PatientsHistoryTable;

