"use client";

import type { PatientRow } from "../organisms/clinician/PatientsListContent";
import { Button } from "@/components/ui/Button";

interface Props {
  data: PatientRow[];
  rowStart?: number;
  highlightedPatientId?: string | null;
  onOpenDiagnosis: (patient: PatientRow) => void;
  onStartConsultation: (patient: PatientRow) => void;
}

const getSexLabel = (sex: PatientRow["sex"]) =>
  sex === "M" ? "Masculino" : "Femenino";

export const PatientsTable: React.FC<Props> = ({
  data,
  rowStart = 0,
  highlightedPatientId = null,
  onOpenDiagnosis,
  onStartConsultation,
}) => {
  return (
    <div className="mt-6 w-full space-y-4">
      <div className="space-y-3 md:hidden">
        {data.map((p, index) => (
          <article
            key={p.patientId}
            className={`rounded-lg border bg-nutri-white p-4 shadow-sm ${
              highlightedPatientId === p.patientId
                ? "border-nutri-primary/40"
                : "border-nutri-light-grey"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-nutri-dark-grey/70">
                  Paciente #{rowStart + index + 1}
                </p>
                <h3 className="text-sm font-semibold text-nutri-dark-grey">{p.name}</h3>
              </div>
              <span className="inline-flex rounded-full border border-nutri-primary/20 bg-nutri-off-white px-2 py-0.5 text-xs font-semibold text-nutri-primary">
                {p.nutritionalStatus}
              </span>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div className="col-span-2">
                <dt className="text-xs text-nutri-dark-grey/70">Tutor</dt>
                <dd className="font-medium text-nutri-dark-grey">{p.guardian}</dd>
              </div>
              <div>
                <dt className="text-xs text-nutri-dark-grey/70">Cedula</dt>
                <dd className="font-medium text-nutri-dark-grey">{p.ci}</dd>
              </div>
              <div>
                <dt className="text-xs text-nutri-dark-grey/70">Edad</dt>
                <dd className="font-medium text-nutri-dark-grey">{p.ageLabel}</dd>
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

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="px-3 py-1.5 text-xs"
                onClick={() => onOpenDiagnosis(p)}
              >
                Ver diagnostico
              </Button>
              <Button
                type="button"
                variant="outline"
                className="px-3 py-1.5 text-xs"
                onClick={() => onStartConsultation(p)}
              >
                Nueva consulta
              </Button>
            </div>
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
              <th className="px-3 py-2 text-left font-semibold">Nombre del tutor</th>
              <th className="px-3 py-2 text-left font-semibold">Cedula</th>
              <th className="px-3 py-2 text-left font-semibold">Edad</th>
              <th className="px-3 py-2 text-left font-semibold">Sexo</th>
              <th className="px-3 py-2 text-left font-semibold">Ultima consulta</th>
              <th className="px-3 py-2 text-left font-semibold">Estado nutricional</th>
              <th className="px-3 py-2 text-left font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {data.map((p, index) => (
              <tr
                key={p.patientId}
                className={`border-t ${
                  highlightedPatientId === p.patientId
                    ? "border-nutri-primary/30 bg-nutri-off-white/60"
                    : "border-nutri-light-grey"
                }`}
              >
                <td className="px-3 py-2">{rowStart + index + 1}</td>
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">{p.guardian}</td>
                <td className="px-3 py-2">{p.ci}</td>
                <td className="px-3 py-2">{p.ageLabel}</td>
                <td className="px-3 py-2">{getSexLabel(p.sex)}</td>
                <td className="px-3 py-2">{p.lastConsult}</td>
                <td className="px-3 py-2">{p.nutritionalStatus}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => onOpenDiagnosis(p)}
                    >
                      Ver diagnostico
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => onStartConsultation(p)}
                    >
                      Nueva consulta
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-nutri-dark-grey">
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
