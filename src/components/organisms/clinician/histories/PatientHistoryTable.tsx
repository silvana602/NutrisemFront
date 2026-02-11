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
    <div className="space-y-4 rounded-md bg-nutri-white p-4 shadow">
      <h2 className="text-lg font-semibold text-nutri-dark-grey">
        Historial Clinico
      </h2>

      {rows.length === 0 ? (
        <p className="text-sm text-nutri-dark-grey">
          No hay registros clinicos para este paciente.
        </p>
      ) : (
        <>
          <table className="w-full border-collapse text-sm">
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
