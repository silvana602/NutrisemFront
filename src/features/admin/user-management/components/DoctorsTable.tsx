"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { buildAdminDoctorProfilePath } from "@/lib/routes/admin";
import type { DoctorManagementRow } from "../types";
import { formatMinutesLabel } from "../utils";
import { DoctorStatusBadge } from "./DoctorStatusBadge";

type DoctorsTableProps = {
  rows: DoctorManagementRow[];
  onResetPassword: (row: DoctorManagementRow) => void;
  onToggleAccess: (row: DoctorManagementRow) => void;
};

export function DoctorsTable({
  rows,
  onResetPassword,
  onToggleAccess,
}: DoctorsTableProps) {
  return (
    <section className="nutri-platform-surface p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-nutri-primary">Lista de médicos</h2>
        <p className="mt-1 text-sm text-nutri-dark-grey/85">
          Validación de especialidad, colegiatura, estado y desempeño de atención.
        </p>
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-nutri-light-grey/80 md:block">
        <table className="min-w-[1020px] w-full bg-white/80 text-sm">
          <thead className="bg-nutri-off-white text-xs uppercase tracking-wide text-nutri-dark-grey/80">
            <tr>
              <th className="px-3 py-3 text-left">Nombre</th>
              <th className="px-3 py-3 text-left">Especialidad</th>
              <th className="px-3 py-3 text-left">Nro. colegiatura</th>
              <th className="px-3 py-3 text-left">Estado</th>
              <th className="px-3 py-3 text-left">Consultas realizadas</th>
              <th className="px-3 py-3 text-left">Promedio tiempo/paciente</th>
              <th className="px-3 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.clinicianId} className="border-t border-nutri-light-grey/70">
                <td className="px-3 py-3">
                  <Link
                    href={buildAdminDoctorProfilePath(row.clinicianId)}
                    className="font-semibold text-nutri-primary hover:underline"
                  >
                    {row.nombreCompleto}
                  </Link>
                </td>
                <td className="px-3 py-3 text-nutri-dark-grey">{row.especialidad}</td>
                <td className="px-3 py-3 text-nutri-dark-grey">{row.numeroColegiatura}</td>
                <td className="px-3 py-3">
                  <DoctorStatusBadge status={row.estadoAcceso} />
                </td>
                <td className="px-3 py-3 font-semibold text-nutri-dark-grey">
                  {row.consultasRealizadas}
                </td>
                <td className="px-3 py-3 text-nutri-dark-grey">
                  {formatMinutesLabel(row.promedioMinutosPorPaciente)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={buildAdminDoctorProfilePath(row.clinicianId)}>
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
                    <Button
                      variant="outline"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => onToggleAccess(row)}
                    >
                      {row.estadoAcceso === "activo"
                        ? "Suspender acceso"
                        : "Reactivar acceso"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-nutri-dark-grey">
                  No hay médicos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <article key={row.clinicianId} className="rounded-xl border border-nutri-light-grey/80 bg-white/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  href={buildAdminDoctorProfilePath(row.clinicianId)}
                  className="text-sm font-semibold text-nutri-primary hover:underline"
                >
                  {row.nombreCompleto}
                </Link>
                <p className="mt-1 text-xs text-nutri-dark-grey/80">{row.especialidad}</p>
              </div>
              <DoctorStatusBadge status={row.estadoAcceso} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-nutri-dark-grey/70">Colegiatura</dt>
                <dd className="font-medium text-nutri-dark-grey">{row.numeroColegiatura}</dd>
              </div>
              <div>
                <dt className="text-xs text-nutri-dark-grey/70">Consultas</dt>
                <dd className="font-medium text-nutri-dark-grey">{row.consultasRealizadas}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-nutri-dark-grey/70">Promedio por paciente</dt>
                <dd className="font-medium text-nutri-dark-grey">
                  {formatMinutesLabel(row.promedioMinutosPorPaciente)}
                </dd>
              </div>
            </dl>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={buildAdminDoctorProfilePath(row.clinicianId)}>
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
              <Button
                variant="outline"
                className="px-3 py-1.5 text-xs"
                onClick={() => onToggleAccess(row)}
              >
                {row.estadoAcceso === "activo"
                  ? "Suspender acceso"
                  : "Reactivar acceso"}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
