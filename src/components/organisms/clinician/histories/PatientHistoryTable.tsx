"use client";

import React, { useMemo, useState } from "react";
import { Pagination } from "@/components/atoms/Pagination";
import { db } from "@/mocks/db";

import type {
  AnthropometricData,
  Consultation,
  Diagnosis,
  History,
  Patient,
} from "@/types";

interface Props {
  patientId: string;
}

type HistoryRow = {
  historyId: string;
  consultDate: Date;
  weightKg: number | "-";
  heightM: number | "-";
  nutritionalDiagnosis: string;
};

export const PatientsHistoryTable: React.FC<Props> = ({ patientId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const history: History[] = useMemo(() => {
    return db.histories
      .filter((h) => h.patientId === patientId)
      .sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime());
  }, [patientId]);

  const patient: Patient | undefined = useMemo(
    () => db.patients.find((p) => p.patientId === patientId),
    [patientId]
  );

  const rows: HistoryRow[] = useMemo(() => {
    return history.map((h) => {
      const diagnosis: Diagnosis | undefined = db.diagnoses.find(
        (d) => d.medicalHistoryId === h.historyId
      );

      const consultation: Consultation | undefined = diagnosis
        ? db.consultations.find(
            (c) => c.consultationId === diagnosis.consultationId
          )
        : undefined;

      const anthropometric: AnthropometricData | undefined = consultation
        ? db.anthropometricData.find(
            (a) => a.consultationId === consultation.consultationId
          )
        : undefined;

      return {
        historyId: h.historyId,
        consultDate: consultation?.date ?? h.creationDate,
        weightKg: anthropometric?.weightKg ?? "-",
        heightM: anthropometric?.heightM ?? "-",
        nutritionalDiagnosis: diagnosis?.nutritionalDiagnosis ?? "Sin dato",
      };
    });
  }, [history]);

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return rows.slice(start, start + itemsPerPage);
  }, [rows, currentPage]);

  const getAgeAtDate = (birthDate: Date, consultDate: Date) => {
    let age = consultDate.getFullYear() - birthDate.getFullYear();
    const m = consultDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && consultDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-4 rounded-md bg-nutri-white p-3 shadow sm:p-4">
      <h2 className="text-lg font-semibold text-nutri-dark-grey">
        Historial Clinico
      </h2>

      {rows.length === 0 ? (
        <p className="text-sm text-nutri-dark-grey">
          No hay registros clinicos para este paciente.
        </p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {currentData.map((row) => (
              <article
                key={row.historyId}
                className="rounded-lg border border-nutri-light-grey bg-nutri-white p-4 shadow-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-nutri-dark-grey/70">
                  Consulta
                </p>
                <h3 className="text-sm font-semibold text-nutri-dark-grey">
                  {row.consultDate.toLocaleDateString()}
                </h3>

                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-nutri-dark-grey/70">Edad</dt>
                    <dd className="font-medium text-nutri-dark-grey">
                      {patient
                        ? getAgeAtDate(patient.birthDate, row.consultDate)
                        : "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-nutri-dark-grey/70">Peso (kg)</dt>
                    <dd className="font-medium text-nutri-dark-grey">{row.weightKg}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-nutri-dark-grey/70">Talla (m)</dt>
                    <dd className="font-medium text-nutri-dark-grey">{row.heightM}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-nutri-dark-grey/70">
                      Diagnostico nutricional
                    </dt>
                    <dd className="font-medium text-nutri-dark-grey">
                      {row.nutritionalDiagnosis}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex items-center gap-4 text-sm font-medium text-nutri-primary">
                  <span className="cursor-pointer hover:underline">Diagnostico</span>
                  <span className="cursor-pointer hover:underline">Reporte</span>
                </div>
              </article>
            ))}
          </div>

          <p className="hidden text-xs text-nutri-dark-grey md:block lg:hidden">
            Desliza horizontalmente para ver todas las columnas.
          </p>

          <div className="hidden w-full overflow-x-auto rounded-lg border border-nutri-light-grey md:block">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="bg-nutri-off-white">
                  <th className="px-3 py-2 text-left">Fecha de Consulta</th>
                  <th className="px-3 py-2 text-left">Edad</th>
                  <th className="px-3 py-2 text-left">Peso (kg)</th>
                  <th className="px-3 py-2 text-left">Talla (m)</th>
                  <th className="px-3 py-2 text-left">Diagnostico Nutricional</th>
                  <th className="px-3 py-2 text-left">Diagnostico Completo</th>
                  <th className="px-3 py-2 text-left">Reporte</th>
                </tr>
              </thead>

              <tbody>
                {currentData.map((row) => (
                  <tr
                    key={row.historyId}
                    className="border-b border-nutri-light-grey hover:bg-nutri-off-white"
                  >
                    <td className="px-3 py-2">
                      {row.consultDate.toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      {patient
                        ? getAgeAtDate(patient.birthDate, row.consultDate)
                        : "-"}
                    </td>
                    <td className="px-3 py-2">{row.weightKg}</td>
                    <td className="px-3 py-2">{row.heightM}</td>
                    <td className="px-3 py-2">{row.nutritionalDiagnosis}</td>
                    <td className="cursor-pointer px-3 py-2 text-nutri-primary hover:underline">
                      Ver
                    </td>
                    <td className="cursor-pointer px-3 py-2 text-nutri-primary hover:underline">
                      Ver
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PatientsHistoryTable;
