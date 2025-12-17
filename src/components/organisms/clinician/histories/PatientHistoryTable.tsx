"use client";

import React from "react";

interface HistoryEntry {
  id: number;
  consultationId: string;
  diagnostic: string;
  age: string | number;
  weight: string | number;
  height: string | number;
  date: string;
  complete: boolean;
}

interface PatientHistoryTableProps {
  data: HistoryEntry[];
}

export const PatientHistoryTable: React.FC<PatientHistoryTableProps> = ({ data }) => {
  return (
    <div className="w-full overflow-x-auto border rounded-md">
      <table className="min-w-[900px] w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2">Nro</th>
            <th className="px-3 py-2">Diagnóstico</th>
            <th className="px-3 py-2">Edad</th>
            <th className="px-3 py-2">Peso</th>
            <th className="px-3 py-2">Talla</th>
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Reporte</th>
          </tr>
        </thead>
        <tbody>
          {data.map((h) => (
            <tr key={h.consultationId} className="border-t">
              <td className="px-3 py-2">{h.id}</td>
              <td className="px-3 py-2">{h.diagnostic}</td>
              <td className="px-3 py-2">{h.age}</td>
              <td className="px-3 py-2">{h.weight}</td>
              <td className="px-3 py-2">{h.height}</td>
              <td className="px-3 py-2">{new Date(h.date).toLocaleDateString()}</td>
              <td className="px-3 py-2 text-blue-600 cursor-pointer">Ver</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                No hay historiales para este paciente.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
