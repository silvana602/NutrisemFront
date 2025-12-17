"use client";

import React, { useEffect, useState } from "react";
import { Pagination } from "@/components/atoms/Pagination";
import { db } from "@/mocks/db";

interface History {
  historyId: number;
  patientId: number;
  date: string;
  reason: string;
  professional: string;
  notes?: string;
  type?: "Consulta" | "Control" | "Urgencia"; // ejemplo de badge
}

interface Props {
  patientId: number;
}

export const PatientsHistoryTable: React.FC<Props> = ({ patientId }) => {
  const [history, setHistory] = useState<History[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const itemsPerPage = 5;

  useEffect(() => {
    const allHistory = db.histories
      ?.filter((h: History) => h.patientId === patientId)
      .sort((a: History, b: History) => new Date(b.date).getTime() - new Date(a.date).getTime()) ?? [];

    setHistory(allHistory);
    setCurrentPage(1);
    setExpandedRows([]);
  }, [patientId]);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const currentData = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getBadgeColor = (type?: string) => {
    switch (type) {
      case "Consulta":
        return "bg-blue-100 text-blue-800";
      case "Control":
        return "bg-green-100 text-green-800";
      case "Urgencia":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white shadow rounded-md p-4 space-y-4">
      <h2 className="text-lg font-semibold">Historial de Consultas</h2>

      {history.length === 0 ? (
        <p className="text-sm text-gray-500">
          No hay consultas registradas para este paciente.
        </p>
      ) : (
        <>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 text-left">Fecha</th>
                <th className="py-2 px-3 text-left">Motivo</th>
                <th className="py-2 px-3 text-left">Profesional</th>
                <th className="py-2 px-3 text-left">Tipo</th>
                <th className="py-2 px-3 text-left">Notas</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((h) => {
                const isExpanded = expandedRows.includes(h.historyId);

                return (
                  <React.Fragment key={h.historyId}>
                    <tr
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleRow(h.historyId)}
                    >
                      <td className="py-2 px-3">{new Date(h.date).toLocaleDateString()}</td>
                      <td className="py-2 px-3">{h.reason}</td>
                      <td className="py-2 px-3">{h.professional}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getBadgeColor(h.type)}`}>
                          {h.type ?? "-"}
                        </span>
                      </td>
                      <td className="py-2 px-3">{h.notes ? (isExpanded ? h.notes : `${h.notes.slice(0, 30)}...`) : "-"}</td>
                    </tr>

                    {/* Fila expandida para mostrar notas completas */}
                    {isExpanded && h.notes && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="py-2 px-3 text-gray-700 text-sm">
                          <strong>Notas completas:</strong> {h.notes}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};
