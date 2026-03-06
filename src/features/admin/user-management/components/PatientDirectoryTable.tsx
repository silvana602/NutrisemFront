import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { buildAdminPatientProfilePath } from "@/lib/routes/admin";
import type { PatientDirectoryRow } from "../types";

type PatientDirectoryTableProps = {
  rows: PatientDirectoryRow[];
  onResetPassword: (row: PatientDirectoryRow) => void;
};

export function PatientDirectoryTable({
  rows,
  onResetPassword,
}: PatientDirectoryTableProps) {
  return (
    <section className="nutri-platform-surface p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-nutri-primary">Pacientes registrados</h2>
        <p className="text-sm text-nutri-dark-grey/80">
          Total encontrados: <span className="font-semibold text-nutri-primary">{rows.length}</span>
        </p>
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-nutri-light-grey/80 md:block">
        <table className="min-w-[1120px] w-full bg-white/80 text-sm">
          <thead className="bg-nutri-off-white text-xs uppercase tracking-wide text-nutri-dark-grey/80">
            <tr>
              <th className="px-3 py-3 text-left">Nombre</th>
              <th className="px-3 py-3 text-left">C.I.</th>
              <th className="px-3 py-3 text-left">Edad</th>
              <th className="px-3 py-3 text-left">Rango</th>
              <th className="px-3 py-3 text-left">Consultas</th>
              <th className="px-3 py-3 text-left">Última consulta</th>
              <th className="px-3 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.patientId} className="border-t border-nutri-light-grey/70">
                <td className="px-3 py-3 font-medium text-nutri-dark-grey">{row.nombreCompleto}</td>
                <td className="px-3 py-3 text-nutri-dark-grey">{row.ci}</td>
                <td className="px-3 py-3 text-nutri-dark-grey">{row.edadEtiqueta}</td>
                <td className="px-3 py-3 text-nutri-dark-grey">{row.rangoEdadEtiqueta}</td>
                <td className="px-3 py-3 font-semibold text-nutri-dark-grey">{row.cantidadConsultas}</td>
                <td className="px-3 py-3 text-nutri-dark-grey">{row.ultimaConsultaEtiqueta}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={buildAdminPatientProfilePath(row.patientId)}>
                      <Button variant="outline" className="px-3 py-1.5 text-xs">
                        Editar datos
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => onResetPassword(row)}
                    >
                      Resetear contraseña
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-nutri-dark-grey">
                  No hay pacientes que coincidan con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <article key={row.patientId} className="rounded-xl border border-nutri-light-grey/80 bg-white/80 p-4">
            <p className="text-sm font-semibold text-nutri-primary">{row.nombreCompleto}</p>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-nutri-dark-grey/70">C.I.</dt>
                <dd className="font-medium text-nutri-dark-grey">{row.ci}</dd>
              </div>
              <div>
                <dt className="text-xs text-nutri-dark-grey/70">Edad</dt>
                <dd className="font-medium text-nutri-dark-grey">{row.edadEtiqueta}</dd>
              </div>
              <div>
                <dt className="text-xs text-nutri-dark-grey/70">Rango</dt>
                <dd className="font-medium text-nutri-dark-grey">{row.rangoEdadEtiqueta}</dd>
              </div>
              <div>
                <dt className="text-xs text-nutri-dark-grey/70">Consultas</dt>
                <dd className="font-medium text-nutri-dark-grey">{row.cantidadConsultas}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-nutri-dark-grey/75">
              Última consulta: {row.ultimaConsultaEtiqueta}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={buildAdminPatientProfilePath(row.patientId)}>
                <Button variant="outline" className="px-3 py-1.5 text-xs">
                  Editar datos
                </Button>
              </Link>
              <Button
                variant="outline"
                className="px-3 py-1.5 text-xs"
                onClick={() => onResetPassword(row)}
              >
                Resetear contraseña
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
