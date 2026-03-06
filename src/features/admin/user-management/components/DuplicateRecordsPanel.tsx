"use client";

import { Button } from "@/components/ui/Button";
import type { DuplicatePatientGroup } from "../types";

type DuplicateRecordsPanelProps = {
  groups: DuplicatePatientGroup[];
  onMergeGroup: (group: DuplicatePatientGroup) => void;
};

export function DuplicateRecordsPanel({
  groups,
  onMergeGroup,
}: DuplicateRecordsPanelProps) {
  return (
    <section className="nutri-platform-surface p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-nutri-primary">Limpieza de datos</h2>
      <p className="mt-1 text-sm text-nutri-dark-grey/85">
        Fusiona registros duplicados para mantener consistencia clínica y administrativa.
      </p>

      {groups.length === 0 ? (
        <div className="mt-4 rounded-xl border border-nutri-light-grey/80 bg-white/75 px-4 py-4 text-sm text-nutri-dark-grey/85">
          No se detectaron duplicados con las reglas actuales (C.I. o coincidencia de nombre y fecha de nacimiento).
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {groups.map((group) => (
            <article
              key={group.groupId}
              className="rounded-xl border border-nutri-light-grey/80 bg-white/80 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-nutri-primary">{group.motivo}</p>
                  <p className="text-xs text-nutri-dark-grey/75">
                    Registros detectados: {group.miembros.length}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => onMergeGroup(group)}
                >
                  Fusionar registros
                </Button>
              </div>

              <ul className="mt-3 space-y-2 text-sm">
                {group.miembros.map((member) => (
                  <li
                    key={member.patientId}
                    className="rounded-lg border border-nutri-light-grey/70 bg-nutri-off-white/60 px-3 py-2"
                  >
                    <p className="font-medium text-nutri-dark-grey">
                      {member.nombreCompleto}
                      {member.patientId === group.principalId ? " (registro principal)" : ""}
                    </p>
                    <p className="text-xs text-nutri-dark-grey/75">
                      C.I.: {member.ci} | Edad: {member.edadEtiqueta}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
