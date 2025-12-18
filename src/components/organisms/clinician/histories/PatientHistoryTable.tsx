"use client";

import React, { useMemo, useState } from "react";
import { Pagination } from "@/components/atoms/Pagination";
import { db } from "@/mocks/db";

import type { History, Patient } from "@/types";

interface Props {
  patientId: string;
}

export const PatientsHistoryTable: React.FC<Props> = ({ patientId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Obtener historial del paciente
  const history: History[] = useMemo(() => {
    return db.histories
      .filter((h) => h.patientId === patientId)
      .sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime());
  }, [patientId]);

  // Obtener datos del paciente
  const patient: Patient | undefined = useMemo(
    () => db.patients.find((p) => p.id === patientId),
    [patientId]
  );

  const totalPages = Math.ceil(history.length / itemsPerPage);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return history.slice(start, start + itemsPerPage);
  }, [history, currentPage]);

  // Función para calcular edad en la fecha de la consulta
  const getAgeAtDate = (birthDate: Date, consultDate: Date) => {
    let age = consultDate.getFullYear() - birthDate.getFullYear();
    const m = consultDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && consultDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="bg-white shadow rounded-md p-4 space-y-4">
      <h2 className="text-lg font-semibold">Historial Clínico</h2>

      {history.length === 0 ? (
        <p className="text-sm text-gray-500">
          No hay registros clínicos para este paciente.
        </p>
      ) : (
        <>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 text-left">Fecha de Consulta</th>
                <th className="py-2 px-3 text-left">Edad</th>
                <th className="py-2 px-3 text-left">Peso (kg)</th>
                <th className="py-2 px-3 text-left">Talla (m)</th>
                <th className="py-2 px-3 text-left">Diagnóstico Nutricional</th>
                <th className="py-2 px-3 text-left">Diagnóstico Completo</th>
                <th className="py-2 px-3 text-left">Reporte</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map((h) => (
                <tr key={h.historyId} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">
                    {h.creationDate.toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3">
                    {patient
                      ? getAgeAtDate(patient.birthDate, h.creationDate)
                      : "-"}
                  </td>
                  <td className="py-2 px-3">{h.weightKg}</td>
                  <td className="py-2 px-3">{h.heightCm}</td>
                  <td className="py-2 px-3">{h.nutritionalDiagnosis}</td>
                  <td className="py-2 px-3 text-blue-600 hover:underline cursor-pointer">
                    Ver
                  </td>
                  <td className="py-2 px-3 text-blue-600 hover:underline cursor-pointer">
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
