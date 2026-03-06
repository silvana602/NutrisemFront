"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Heading } from "@/components/atoms/Heading";
import AlertDialog from "@/components/ui/AlertDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { db, seedOnce } from "@/mocks/db";
import {
  DuplicateRecordsPanel,
  PatientDirectoryFilters,
  PatientDirectoryTable,
} from "@/features/admin/user-management/components";
import {
  buildPatientDirectoryRows,
  buildPatientTemporaryPassword,
  createAdminPatientsDataset,
  filterPatientDirectoryRows,
  findDuplicatePatientGroups,
  mergeDuplicatePatients,
} from "@/features/admin/user-management/utils";
import type {
  DuplicatePatientGroup,
  PatientDirectoryRow,
  PatientSearchFilters,
} from "@/features/admin/user-management/types";

seedOnce();

const DEFAULT_FILTERS: PatientSearchFilters = {
  ci: "",
  nombre: "",
  rangoEdad: "all",
};

type PatientActionState = { type: "reset-password"; row: PatientDirectoryRow } | null;

function resolveActionDialogCopy(action: PatientActionState): {
  title: string;
  message: string;
  confirmLabel: string;
} {
  if (!action) {
    return {
      title: "",
      message: "",
      confirmLabel: "Confirmar",
    };
  }

  return {
    title: "Resetear contraseña",
    message: `¿Deseas resetear la contraseña del paciente ${action.row.nombreCompleto}?`,
    confirmLabel: "Resetear",
  };
}

export default function AdminPatientsManagementContent() {
  const searchParams = useSearchParams();

  const [dataset, setDataset] = useState(() => createAdminPatientsDataset(db));
  const [filters, setFilters] = useState<PatientSearchFilters>(DEFAULT_FILTERS);
  const [pendingMergeGroup, setPendingMergeGroup] = useState<DuplicatePatientGroup | null>(
    null
  );
  const [pendingAction, setPendingAction] = useState<PatientActionState>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const directoryRows = useMemo(() => buildPatientDirectoryRows(dataset), [dataset]);
  const filteredRows = useMemo(
    () => filterPatientDirectoryRows(directoryRows, filters),
    [directoryRows, filters]
  );
  const duplicateGroups = useMemo(
    () => findDuplicatePatientGroups(directoryRows),
    [directoryRows]
  );
  const actionDialogCopy = resolveActionDialogCopy(pendingAction);

  const updatedPatientId = searchParams.get("updatedPatientId");
  const highlightedPatient = updatedPatientId
    ? directoryRows.find((row) => row.patientId === updatedPatientId) ?? null
    : null;

  const handleResetPassword = (row: PatientDirectoryRow) => {
    setPendingAction({ type: "reset-password", row });
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;

    const targetPatient =
      dataset.patients.find((patient) => patient.patientId === pendingAction.row.patientId) ??
      null;

    if (!targetPatient) {
      setFeedbackMessage(
        "No se encontró el paciente seleccionado para resetear la contraseña."
      );
      setPendingAction(null);
      return;
    }

    const targetUserId = targetPatient.userId;
    const targetUser = db.users.find((user) => user.userId === targetUserId) ?? null;
    if (!targetUser) {
      setFeedbackMessage("No se encontró el usuario asociado al paciente seleccionado.");
      setPendingAction(null);
      return;
    }

    const temporaryPassword = buildPatientTemporaryPassword(pendingAction.row.ci);
    targetUser.password = temporaryPassword;
    db.passwords.set(targetUserId, temporaryPassword);

    setDataset((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.userId === targetUserId ? { ...user, password: temporaryPassword } : user
      ),
    }));

    setFeedbackMessage(
      `Se reseteó la contraseña de ${pendingAction.row.nombreCompleto}. Contraseña temporal: ${temporaryPassword}.`
    );
    setPendingAction(null);
  };

  const handleConfirmMerge = () => {
    if (!pendingMergeGroup) return;

    const mergeResult = mergeDuplicatePatients(dataset, pendingMergeGroup);
    if (mergeResult.mergedPatientIds.length === 0) {
      setFeedbackMessage("No se encontraron registros adicionales para fusionar.");
      setPendingMergeGroup(null);
      return;
    }

    setDataset(mergeResult.dataset);
    setFeedbackMessage(
      `Se fusionaron ${mergeResult.mergedPatientIds.length} registros en el paciente principal.`
    );
    setPendingMergeGroup(null);
  };

  const duplicatesCount = duplicateGroups.reduce(
    (total, group) => total + Math.max(0, group.miembros.length - 1),
    0
  );

  return (
    <div className="nutri-platform-page px-1 py-1 sm:px-2">
      <div className="nutri-platform-page-header p-4 sm:p-5">
        <Heading
          containerClassName="space-y-2"
          description="Directorio global con búsqueda avanzada y herramientas de limpieza para registros duplicados."
        >
          Gestión de pacientes
        </Heading>
      </div>

      {highlightedPatient ? (
        <div className="nutri-platform-surface-soft rounded-lg border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          Datos de {highlightedPatient.nombreCompleto} actualizados correctamente.
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="nutri-platform-stat px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Pacientes totales
          </p>
          <p className="mt-1 text-2xl font-semibold text-nutri-primary">{directoryRows.length}</p>
        </article>
        <article className="nutri-platform-stat px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Coincidencias con filtros
          </p>
          <p className="mt-1 text-2xl font-semibold text-nutri-primary">{filteredRows.length}</p>
        </article>
        <article className="nutri-platform-stat px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Grupos duplicados
          </p>
          <p className="mt-1 text-2xl font-semibold text-nutri-primary">
            {duplicateGroups.length}
          </p>
        </article>
        <article className="nutri-platform-stat px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-nutri-dark-grey/70">
            Registros por depurar
          </p>
          <p className="mt-1 text-2xl font-semibold text-nutri-primary">{duplicatesCount}</p>
        </article>
      </section>

      <PatientDirectoryFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters(DEFAULT_FILTERS)}
      />

      <PatientDirectoryTable rows={filteredRows} onResetPassword={handleResetPassword} />

      <DuplicateRecordsPanel
        groups={duplicateGroups}
        onMergeGroup={(group) => setPendingMergeGroup(group)}
      />

      <ConfirmDialog
        open={Boolean(pendingMergeGroup)}
        title="Fusionar registros duplicados"
        message={
          pendingMergeGroup
            ? `¿Deseas fusionar ${pendingMergeGroup.miembros.length} registros detectados como duplicados?`
            : ""
        }
        confirmLabel="Fusionar"
        cancelLabel="Cancelar"
        onCancel={() => setPendingMergeGroup(null)}
        onConfirm={handleConfirmMerge}
      />

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={actionDialogCopy.title}
        message={actionDialogCopy.message}
        confirmLabel={actionDialogCopy.confirmLabel}
        cancelLabel="Cancelar"
        onCancel={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
      />

      <AlertDialog
        open={Boolean(feedbackMessage)}
        title="Proceso completado"
        message={feedbackMessage ?? ""}
        onClose={() => setFeedbackMessage(null)}
      />
    </div>
  );
}
