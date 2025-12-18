"use client";

import { colors } from "@/lib/colors";
import type { PatientRow } from "../organisms/clinician/PatientsListContent";

interface Props {
  data: PatientRow[];
}

export const PatientsTable: React.FC<Props> = ({ data }) => {
  return (
    <div className="mt-6 w-full space-y-4">
      <div
        className="w-full overflow-x-auto rounded-lg border"
        style={{ borderColor: colors.lightGrey }}
      >
        <table className="w-full text-sm">
          <thead style={{ background: colors.offWhite }}>
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Nro</th>
              <th className="px-3 py-2 text-left font-semibold">
                Nombre completo
              </th>
              <th className="px-3 py-2 text-left font-semibold">Nombre del guardian</th>
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
            {data.map((p, index) => (
              <tr
                key={p.patientId}
                className="border-t"
                style={{ borderColor: colors.lightGrey }}
              >
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">{p.guardian}</td>
                <td className="px-3 py-2">{p.ci}</td>
                <td className="px-3 py-2">{p.age}</td>
                <td className="px-3 py-2">
                  {p.sex === "M" ? "Masculino" : "Femenino"}
                </td>
                <td className="px-3 py-2">{p.lastConsult}</td>
                <td className="px-3 py-2 text-blue-600 cursor-pointer">Ver</td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-gray-500"
                >
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
