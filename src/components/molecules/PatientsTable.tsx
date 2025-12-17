"use client";

import { useState, useMemo } from "react";
import { colors } from "@/lib/colors";

interface Patient {
  id: number;
  name: string;
  tutor: string;
  ci: string;
  age: number;
  sex: string;
  lastConsult: string;
}

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

interface Props {
  data: Patient[];
}

interface PatientHistoryTableProps {
  data: HistoryEntry[];
}

export const PatientsTable: React.FC<Props> = ({ data }) => {
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [page, data]);

  return (
    <div className="mt-6 w-full space-y-4">
      {/* WRAPPER QUE ACTIVA EL SCROLL */}
      <div
        className="w-full overflow-x-auto rounded-lg border"
        style={{ borderColor: colors.lightGrey }}
      >
        {/* 👇 QUITAMOS el min-width fijo */}
        <table className="w-full text-sm">
          <thead className="bg-gray-50" style={{ background: colors.offWhite }}>
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Nro</th>
              <th className="px-3 py-2 text-left font-semibold">
                Nombre completo
              </th>
              <th className="px-3 py-2 text-left font-semibold">
                Nombre del tutor
              </th>
              <th className="px-3 py-2 text-left font-semibold">Cédula</th>
              <th className="px-3 py-2 text-left font-semibold">Edad</th>
              <th className="px-3 py-2 text-left font-semibold">Sexo</th>
              <th className="px-3 py-2 text-left font-semibold">
                Última consulta
              </th>
              <th className="px-3 py-2 text-left font-semibold">Historial</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((p) => (
              <tr
                key={p.id}
                className="border-t"
                style={{ borderColor: colors.lightGrey }}
              >
                <td className="px-3 py-2">{p.id}</td>
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">{p.tutor}</td>
                <td className="px-3 py-2">{p.ci}</td>
                <td className="px-3 py-2">{p.age}</td>
                <td className="px-3 py-2">{p.sex}</td>
                <td className="px-3 py-2">{p.lastConsult}</td>
                <td className="px-3 py-2 text-blue-600 cursor-pointer">Ver</td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  No se encontraron pacientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};