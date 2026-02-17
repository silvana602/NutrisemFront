"use client";

import type { PatientRow } from "../organisms/clinician/PatientsListContent";

interface Props {
  data: PatientRow[];
}

const getSexLabel = (sex: PatientRow["sex"]) =>
  sex === "M" ? "Masculino" : "Femenino";

export const PatientsTable: React.FC<Props> = ({ data }) => {
  return (
    <div className="mt-6 w-full space-y-4">
      <div className="space-y-3 md:hidden">
        {data.map((p, index) => (
          <article
            key={p.patientId}
            className="rounded-lg border border-nutri-light-grey bg-nutri-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-nutri-dark-grey/70">
                  Paciente #{index + 1}
                </p>
                <h3 className="text-sm font-semibold text-nutri-dark-grey">{p.name}</h3>
              </div>
              <span className="cursor-pointer text-sm font-medium text-nutri-primary">
                Ver
              </span>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div className="col-span-2">
                <dt className="text-xs text-nutri-dark-grey/70">Guardian</dt>
                <dd className="font-medium text-nutri-dark-grey">{p.guardian}</dd>
              </div>
              <div>
                <dt className="text-xs text-nutri-dark-grey/70">Cedula</dt>
                <dd className="font-medium text-nutri-dark-grey">{p.ci}</dd>
              </div>
              <div>
                <dt className="text-xs text-nutri-dark-grey/70">Edad</dt>
                <dd className="font-medium text-nutri-dark-grey">{p.age}</dd>
              </div>
              <div>
                <dt className="text-xs text-nutri-dark-grey/70">Sexo</dt>
                <dd className="font-medium text-nutri-dark-grey">{getSexLabel(p.sex)}</dd>
              </div>
              <div>
                <dt className="text-xs text-nutri-dark-grey/70">Ultima consulta</dt>
                <dd className="font-medium text-nutri-dark-grey">{p.lastConsult}</dd>
              </div>
            </dl>
          </article>
        ))}

        {data.length === 0 && (
          <div className="rounded-lg border border-nutri-light-grey bg-nutri-white px-4 py-6 text-center text-sm text-nutri-dark-grey">
            No se encontraron pacientes.
          </div>
        )}
      </div>

      <p className="hidden text-xs text-nutri-dark-grey md:block lg:hidden">
        Desliza horizontalmente para ver todas las columnas.
      </p>

      <div className="hidden w-full overflow-x-auto rounded-lg border border-nutri-light-grey md:block">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-nutri-off-white">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Nro</th>
              <th className="px-3 py-2 text-left font-semibold">Nombre completo</th>
              <th className="px-3 py-2 text-left font-semibold">Nombre del guardian</th>
              <th className="px-3 py-2 text-left font-semibold">Cedula</th>
              <th className="px-3 py-2 text-left font-semibold">Edad</th>
              <th className="px-3 py-2 text-left font-semibold">Sexo</th>
              <th className="px-3 py-2 text-left font-semibold">Ultima consulta</th>
              <th className="px-3 py-2 text-left font-semibold">Historial</th>
            </tr>
          </thead>

          <tbody>
            {data.map((p, index) => (
              <tr key={p.patientId} className="border-t border-nutri-light-grey">
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">{p.guardian}</td>
                <td className="px-3 py-2">{p.ci}</td>
                <td className="px-3 py-2">{p.age}</td>
                <td className="px-3 py-2">{getSexLabel(p.sex)}</td>
                <td className="px-3 py-2">{p.lastConsult}</td>
                <td className="cursor-pointer px-3 py-2 text-nutri-primary">Ver</td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-nutri-dark-grey">
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
